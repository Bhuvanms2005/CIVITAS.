const jwt = require('jsonwebtoken');
const User = require('../models/user'); 

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.user.id);

        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User associated with this token no longer exists.' });
        }
        req.user = currentUser; 
        next();

    } catch (error) {
        console.error("Error in authMiddleware (JWT verification failed):", error); 
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Not authorized: Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Not authorized: Token expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized: Token validation failed.' });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
                if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: User with role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource.`
            });
        }
        next();
    };
};