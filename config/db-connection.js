import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Get MongoDB URL depending on environment
const mongoURI =
    process.env.NODE_ENV === 'production'
        ? process.env.MONGO_URI   // Online MongoDB (e.g., Atlas)
        : process.env.MONGO_LOCAL_URI // Local MongoDB

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

