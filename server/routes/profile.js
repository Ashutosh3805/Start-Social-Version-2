const express = require('express');
const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer setup ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
});

// ── POST /api/profile ─────────────────────────────────────────────────────────
// Save / update role + role-specific form data (+ optional image) for the logged-in user
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { role } = req.body;

        const validRoles = ['startup', 'investor', 'freelancer', 'manufacturer'];
        if (!role || !validRoles.includes(role))
            return res.status(400).json({ message: 'Invalid role' });

        // Parse profile fields (sent as individual form-data fields)
        let profile = {};
        try {
            // Support both JSON string and individual fields
            if (req.body.profile) {
                profile = JSON.parse(req.body.profile);
            } else {
                // individual multipart fields
                const excluded = ['role', 'profile'];
                for (const key of Object.keys(req.body)) {
                    if (!excluded.includes(key)) profile[key] = req.body[key];
                }
            }
        } catch {
            profile = {};
        }

        // Attach image URL if an image was uploaded
        if (req.file) {
            profile.imageUrl = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { role, profile },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile saved', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/profile ──────────────────────────────────────────────────────────
// Get logged-in user's own profile
router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ role: user.role, profile: user.profile });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── GET /api/profiles?role=... ────────────────────────────────────────────────
// Public endpoint: list all profiles for a given role
router.get('/all', async (req, res) => {
    try {
        const { role } = req.query;
        const validRoles = ['startup', 'investor', 'freelancer', 'manufacturer'];
        if (!role || !validRoles.includes(role))
            return res.status(400).json({ message: 'Invalid or missing role parameter' });

        const users = await User.find({ role }).select('name role profile createdAt');

        const profiles = users.map(u => ({
            id: u._id,
            name: u.name,
            role: u.role,
            profile: u.profile,
            createdAt: u.createdAt,
        }));

        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
