import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './router/auth';
import router from './router';

dotenv.config();

const app = express();


app.use(cors({ credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);  
app.use('/', router());  

const server = http.createServer(app);


const mongoUrl = process.env.MONGO_URI;

if (!mongoUrl) {
    console.error('MongoDB URI is not defined in the .env file.');
    process.exit(1); 
}

mongoose.Promise = Promise;
mongoose.connect(mongoUrl)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error: Error) => {
        console.error('MongoDB connection error:', error);
    });


server.listen(3500, () => {
    console.log('Server running on http://localhost:3500/');
});


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
