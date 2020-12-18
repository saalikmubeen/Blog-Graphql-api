import isLoggedIn from '../utils/isLoggedIn'

const Query = {
    users(parent, args, context, info) {
        const { prisma } = context
        const queryObj = { first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy } // operation arguments

        if (args.query) {
            queryObj.where = {
                OR: [
                    { name_contains: args.query },
                    { email_contains: args.query }
                    
                ]
            }
        }
        
        return prisma.query.users(queryObj, info)
    },

    posts(parent, args, context, info){
        const { prisma } = context
        const queryObj = { where: { published: true }, first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy }

        if (args.query) {
            queryObj.where.OR = [
                    { title_contains: args.query },
                    { body_contains: args.query }
                ]
        }
        
        return prisma.query.posts(queryObj, info)
    },

    comments(parent, args, context, info){
        const { prisma } = context
        const queryObject = { first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy }
        
        return prisma.query.comments(queryObject, info)
    },

    // only returns published posts(if user is not authenticated) or returns the unpublished and published posts(if user is authenticated)
    async post(parent, args, context, info) {
        const { prisma, request } = context
        const userID = isLoggedIn(request, false)  // will be a string or null

        const posts = await prisma.query.posts({
            where:
            {
                id: args.id,
                OR: [
                    { published: true },
                    { author: { id: userID } }
                ]
            }
        }, info)
        
        if (posts.length === 0) {
            throw new Error('Post not found!')
        }

        return posts[0]
    },

    async me(parent, args, context, info) {
        const { prisma, request } = context
        const userID = isLoggedIn(request)

        const user = await prisma.query.user({ where: { id: userID } })
        
        if (!user) {
            throw new Error('Profile not found!')
        }

        return user
    },

    async myPosts(parent, args, context, info) {
        const { prisma, request } = context
        const userID = isLoggedIn(request)
        const queryObj = { where: { author: { id: userID }  }, first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy }

        if (args.query) {
            queryObj.where.OR = [
                    { title_contains: args.query },
                    { body_contains: args.query }
                ]
        }

        const posts = await prisma.query.posts(queryObj, info)

        return posts 
    }
}

export default Query;