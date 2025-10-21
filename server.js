import express from 'express'
import dotenv from 'dotenv'
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors'
import { connectDB } from './config/db-connection.js';
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express();

//middlewares
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
app.use(morgan("dev"))

//error handler


//database connection
connectDB()

app.get('/', (req, res) => {
    res.send('Smart Poultry Running')
})

//routes
// 1. Auth Routes
app.use('/api/v1/auth', authRoutes);



// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    logger.error(`${err.message} - ${req.originalUrl}`);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
    });
});


const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`App running on http://localhost:${PORT}`)
})