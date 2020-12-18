import isLoggedIn from '../utils/isLoggedIn'

const User = {

    email: {
        fragment: 'fragment userID on User { id }',
        resolve(parent, args, context, info) {
            const { request } = context
            const userID = isLoggedIn(request, false)

            if (userID && userID === parent.id) {
                return parent.email
            } else {
                return null
            }
        }
    },

    posts: {
        fragment: 'fragment userID on User { id }',
        async resolve(parent, args, context, info) {
            const { prisma } = context

            const posts = await prisma.query.posts({ where: { published: true, author: { id: parent.id } } })
        
            return posts
        }
    }
}


export default User;