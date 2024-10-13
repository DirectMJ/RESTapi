import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';

let users: { id: number, email: string, password: string }[] = [];

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExists = users.find(user => user.email === email);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword };
    users.push(newUser);

    return res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } });
};

export const login = (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );

    return res.status(200).json({ token }); 
};

export const getProfile = (req: AuthRequest, res: Response) => {
    const userId = req.user.id; 
    const user = users.find(user => user.id === userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: { id: user.id, email: user.email } });
};
