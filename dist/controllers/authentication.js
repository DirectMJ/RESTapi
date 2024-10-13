"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const users_1 = require("../models/users");
const helpers_1 = require("../helpers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const user = await (0, users_1.getUserByEmail)(email).select('+authentication.salt +authentication.password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const expectedHash = (0, helpers_1.authentication)(user.authentication.salt, password);
        if (user.authentication.password !== expectedHash) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const salt = (0, helpers_1.random)();
        user.authentication.sessionToken = (0, helpers_1.authentication)(salt, user._id.toString());
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('MJ-AUTH', user.authentication.sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });
        return res.status(200).json({ token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }
        const salt = (0, helpers_1.random)();
        const user = await (0, users_1.createUser)({
            email,
            username,
            authentication: {
                salt,
                password: (0, helpers_1.authentication)(salt, password),
            },
        });
        return res.status(201).json({ message: 'User registered successfully.', user });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
exports.register = register;
//# sourceMappingURL=authentication.js.map