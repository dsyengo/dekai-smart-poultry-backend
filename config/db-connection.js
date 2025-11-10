import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Get MongoDB URI depending on environment
const MONGO_URI =
    process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI // Online MongoDB for deployment
        : process.env.MONGO_LOCAL_URI // Local MongoDB for development

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
        })
        console.log(`MongoDB successfully connected to ${conn.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}
