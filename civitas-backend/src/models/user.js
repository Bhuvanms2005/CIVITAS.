const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be of minimum 2 characters']
    },
    lastName: {
        type: String,
        required: function() { return !this.googleId; },
        trim: true,
        minlength: [2, 'Last name must be of minimum of 2 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter the valid email address']
    },
    phone: {
        type: String,
        required: function() { return !this.googleId; },
        unique: true,
        sparse: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Phone number must start with 6,7,8 or 9 and must be of 10 digits']
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: [8, 'Password must be of minimum 8 characters'],
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['volunteer', 'ngo', 'admin'],
        default: 'volunteer'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const user = mongoose.model('user', userSchema);
module.exports = user;