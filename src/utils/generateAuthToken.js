import jwt from 'jsonwebtoken'

const generateAuthToken = (id) => {
    return jwt.sign({ id: id }, 'your life is limited, do not waste it living someone elses life', { expiresIn: '7 days' })
}

export { generateAuthToken as default }