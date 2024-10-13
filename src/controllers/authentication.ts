import express from 'express';
import { getUserByEmail, createUser } from '../models/users';
import { authentication, random } from '../helpers';
import jwt from 'jsonwebtoken';



export const login = async (req: express.Request, res: express.Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); 
        }

        const expectedHash = authentication(user.authentication.salt, password);

        if (user.authentication.password !== expectedHash) {
            return res.status(401).json({ message: 'Invalid credentials.' }); 
        }

        const salt = random();
        user.authentication.sessionToken = authentication(salt, user._id.toString());
        
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.cookie('MJ-AUTH', user.authentication.sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/' });

        return res.status(200).json({ token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

export const register = async (req: express.Request, res: express.Response) => {
    try {
        const { username, password, email } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists." });
        }

        const salt = random();
        const user = await createUser({
            email,
            username,
            authentication: {
                salt,
                password: authentication(salt, password),
            },
        });

        return res.status(201).json({ message: 'User registered successfully.', user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." });
    }
}

