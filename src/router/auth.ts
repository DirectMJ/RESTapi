import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail, createUser, getUserById } from '../models/users';  
import { authenticateJWT } from '../middlewares/authMiddleware';
import { AuthRequest } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';



const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({  
            username,
            email,
            authentication: {
                password: hashedPassword,
                salt: '', 
                sessionToken: '',
            },
        });

        return res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmail(email); 
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.authentication.password); 
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1h' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error during login' });
    }
});

router.get('/user/:id', authenticateJWT, async (req: AuthRequest, res) => {
    const { id } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    try {
        console.log(id);
        const user = await getUserById(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/protected', authenticateJWT, (req: AuthRequest, res) => {
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

export default router;
