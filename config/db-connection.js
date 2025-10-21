import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

//local monngo connection
const LOCAL_URL = process.env.MONGO_LOCAL_URI;
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(LOCAL_URL)
        console.log(`MongoDB successfully connected to ${conn.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

