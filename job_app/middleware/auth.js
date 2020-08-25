const jwt = require('jsonwebtoken')
const config = require('config')

const protect = (req, res, next) => {

    // Get token from header
    const token = req.header('x-auth-token')

    // Check if not token
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied'})
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next()
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid'})
    }
}

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log(req.user.role)
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Not Allowed'})
        }

        next()
    }
}

module.exports = {
    protect,
    authorize
}