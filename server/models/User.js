const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        // Set on /onboarding after role selection
        role: {
            type: String,
            enum: ['startup', 'investor', 'freelancer', 'manufacturer', null],
            default: null,
        },
        // Stores the role-specific form data
        profile: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
