const express = require('express');
const { body } = require('express-validator');
const { signup, login, requestPasswordReset, resetPassword } = require('../components/controllers/authController');
const { getSingleComplaintForNgo } = require('../components/controllers/complaintController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const signupValidationRules = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('phone').isMobilePhone('en-IN').withMessage('Please enter a 10-digit indian phone number starting with 6, 7, 8, or 9'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/).withMessage('Password must include at least one special character'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Confirm password does not match password.');
        }
        return true;
    }),
    body('terms').isBoolean().custom(value => {
        if (!value) {
            throw new Error('You must accept the Terms and Conditions.');
        }
        return true;
    }).withMessage('You must accept the Terms and Conditions.')
];

const loginValidationRules = [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    body('password').exists().withMessage('Password is required')
];

router.post('/signup', signupValidationRules, signup);

router.post('/login', loginValidationRules, login);

router.post('/request-password-reset', requestPasswordReset);

router.post('/reset-password', resetPassword);

router.get(
  '/complaints/:id/resolution-form',
  getSingleComplaintForNgo 
);

router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin?error=google_auth_failed&message=Google authentication failed.` }),
    (req, res) => {
        const token = jwt.sign(
            { user: { id: req.user.id, role: req.user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );
        const userWithoutPassword = {
            id: req.user.id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role
        };
        const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin?token=${token}&user=${encodeURIComponent(JSON.stringify(userWithoutPassword))}`;
        res.redirect(frontendRedirectUrl);
    }
);

module.exports = router;