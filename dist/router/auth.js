"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = require("../models/users");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await (0, users_1.createUser)({
            username,
            email,
            authentication: {
                password: hashedPassword,
                salt: '',
                sessionToken: '',
            },
        });
        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await (0, users_1.getUserByEmail)(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.authentication.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
        return res.status(200).json({ token });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});
router.get('/user/:id', authMiddleware_1.authenticateJWT, async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    try {
        console.log(id);
        const user = await (0, users_1.getUserById)(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
router.get('/protected', authMiddleware_1.authenticateJWT, (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(200).json({
        message: 'Protected route',
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
        },
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map