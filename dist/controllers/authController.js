"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let users = [];
const register = async (req, res) => {
    const { email, password } = req.body;
    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword };
    users.push(newUser);
    return res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } });
};
exports.register = register;
const login = (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (!user || !bcryptjs_1.default.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
};
exports.login = login;
const getProfile = (req, res) => {
    const userId = req.user.id;
    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: { id: user.id, email: user.email } });
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map