const { validationResult } = require('express-validator');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../../utils/emailService');

exports.signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    try {
        let userByEmail = await User.findOne({ email });
        if (userByEmail) {
            return res.status(400).json({ success: false, message: 'User with this email already exists.' });
        }

        let userByPhone = await User.findOne({ phone });
        if (userByPhone) {
            return res.status(400).json({ success: false, message: 'User with this phone number already exists.' });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully and logged in!',
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        console.error('Signup error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A user with this email or phone number already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error during registration. Please try again later.' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials.' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Password is incorrect' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Logged in successfully!',
                    token,
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role
                    }
                });
            }
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login. Please try again later.' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
        }

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;

        const emailResult = await sendPasswordResetEmail(user.email, resetLink);

        if (emailResult.success) {
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
        } else {
            console.error('Failed to send reset email:', emailResult.message);
            res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent to your inbox.' });
        }

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { userId, token, newPassword } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user or token.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new one.' });
            }
            return res.status(400).json({ success: false, message: 'Invalid password reset token.' });
        }

        if (decoded.id !== userId) {
            return res.status(400).json({ success: false, message: 'Invalid password reset link.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
};

