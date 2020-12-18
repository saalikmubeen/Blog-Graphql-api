import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isLoggedIn from '../utils/isLoggedIn'
import generateAuthToken from '../utils/generateAuthToken'
import hashPassword from '../utils/hashPassword' 

const Mutation = {
    async createUser(parent, args, context, info) {
        const { prisma } = context

        const emailTaken = await prisma.exists.User({email: args.data.email}) 

        if(emailTaken){
            throw new Error('Email already in use.')
        }

        const hashedPassword = await hashPassword(args.data.password)

        const newUser = await prisma.mutation.createUser(
            { data: {...args.data, password: hashedPassword} })

        return {
            user: newUser,
            token: generateAuthToken(newUser.id)
        }
    },

    async deleteUser(parent, args, context, info) {
        const { prisma, request } = context
        const userID = isLoggedIn(request)
        
        const userExists = await prisma.exists.User({id: userID})

        if(!userExists){
            throw new Error('User does not exist.')
        }

        const deletedUser = await prisma.mutation.deleteUser({ where: { id: userID } }, info)
        
        return deletedUser

    },

    async updateUser(parent, args, context, info) {
        const {prisma, request} = context
        const { data } = args

        const userID = isLoggedIn(request)
        
        const userExists = await prisma.exists.User({id: userID})

        if (!userExists) {
            throw new Error('User does not exist!')
        }

        if (typeof data.password === 'string') {
            data.password = await hashPassword(data.password)
        }

        const updatedUser = await prisma.mutation.updateUser({ where: { id: userID }, data: data }, info)
        
        return updatedUser
    },

    async createPost(parent, args, context, info){
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const newPost = await prisma.mutation.createPost({ data: { ...args.data, author: { connect: { id: userID } } } }, info)
        
        return newPost
    },

    async deletePost(parent, args, context, info) {
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        // check if post exists and the author of the post is the currently logged in user
        const postExists = await prisma.exists.Post({ id: args.id, author: { id: userID } })
        
        if (!postExists) {
            throw new Error('Unable to delete post!')
        }

        const deletedPost = await prisma.mutation.deletePost({ where: { id: args.id } }, info)
        
        return deletedPost

    },

    async updatePost(parent, args, context, info) {
        const { id, data } = args
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const postExists = await prisma.exists.Post({ id: id, author: { id: userID } })
        const isPublished = await prisma.exists.Post({ id: id, published: true })
        
        if (!postExists) {
            throw new Error('Unable to update post!')
        }

        // delete comments related to the post if post was published and now is being unpublished
        if (isPublished && data.published === false) {
            await prisma.mutation.deleteManyComments({ where: { post: { id: id } } })
        }
        
        const updatedPost = await prisma.mutation.updatePost({ where: { id: id }, data: data }, info)
        
        return updatedPost
    },

    async createComment(parent, args, context, info){
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const postExists = await prisma.exists.Post({ id: args.data.post, published: true })
        
        if (!postExists) {
            throw new Error('Post not found!')
        }
        
        const newComment = await prisma.mutation.createComment({
            data: {
                text: args.data.text,
                author: { connect: { id: userID } },
                post: { connect: { id: args.data.post } }
            }
        }, info)

        return newComment
    },

    async deleteComment(parent, args, context, info){
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const commentExists = await prisma.exists.Comment({ id: args.id, author: { id: userID } })
        
        if (!commentExists) {
            throw new Error('Unable to delete Comment!')
        }
        
        const deletedComment = await prisma.mutation.deleteComment({ where: { id: args.id } }, info)
        
        return deletedComment
    },

    async updateComment(parent, args, context, info) {
        const { id, data } = args
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const commentExists = await prisma.exists.Comment({ id: args.id, author: { id: userID } })
        
        if (!commentExists) {
            throw new Error('Unable to update Comment!')
        }
        
        const updatedComment = await prisma.mutation.updateComment({ where: { id: id }, data: data }, info)
        
        return updatedComment
    },

    async login(parent, args, context, info) {
        const { prisma } = context
        
        const user = await prisma.query.user({ where: { email: args.data.email } })
        
        if (!user) {
            throw new Error('Incorrect email or password!')
        }

        const passwordsMach = await bcrypt.compare(args.data.password, user.password)

        if (!passwordsMach) {
            throw new Error('Incorrect email or password!')
        }

        return {
            user: user,
            token: generateAuthToken(user.id)
        }
    }

}
    

export default Mutation;