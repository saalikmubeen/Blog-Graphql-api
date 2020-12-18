import jwt from 'jsonwebtoken'

const isLoggedIn = (request, requireAuth = true) => {
    const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization
    // request.request.headers.authorization (for queries and mutations) ; request.connection.context.Authorization (for subscriptions)

    if (!header && requireAuth) {
        throw new Error('You are not authenticated!')
    }

    if (!header && !requireAuth) {
        return null
    }

    const token = header.replace('Bearer ', '')

    const decoded = jwt.verify(token, 'your life is limited, do not waste it living someone elses life')

    return decoded.id
}

export {
    isLoggedIn as
    default
}