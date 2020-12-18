import isLoggedIn from '../utils/isLoggedIn'

const Subscription = {

    comment: {
        subscribe(parent, args, context, info) {
            const { prisma } = context
            
            return prisma.subscription.comment({
                where: { node: { post: { id: args.postID } } }
            }, info)
        }
    },

    post: {
        subscribe(parent, args, context, info) {
            const { prisma } = context
            
            return prisma.subscription.post({
                where: { node: { published: true } }
            }, info)
        }
    },

    myPosts: {
        subscribe(parent, args, context, info) {
            const { prisma, request } = context
            const userID = isLoggedIn(request, true)

            return prisma.subscription.post({
                where: { node: { author: { id: userID } } }
            }, info)
        }
    }
}

export {Subscription as default}