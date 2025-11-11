import express from 'express'
import dotenv from 'dotenv'
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors'
import { connectDB } from './config/db-connection.js';
import authRoutes from './routes/authRoutes.js'
import farmRoutes from './routes/farmRoutes.js'
import diseaseHistoryRoutes from "./routes/diseaseHistoryRoutes.js";
import analysisRoutes from './routes/analysisRoutes.js'
import chatRoutes from './routes/chatbotRoutes.js'


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
//2.Farm data routes
app.use("/api/v1/farm", farmRoutes);
//3. Analysis routes
app.use('/api/v1/analysis', analysisRoutes)
//4. History and reports
app.use("/api/v1/disease-history", diseaseHistoryRoutes);
//5. Chatbot
app.use("/api/v1/chat", chatRoutes)




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