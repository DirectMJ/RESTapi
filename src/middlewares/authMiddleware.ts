import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); 

export interface AuthRequest extends Request {  
    user?: any; 
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
       
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
