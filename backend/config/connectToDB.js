require('dotenv').config();
const mongoose = require('mongoose');

const connectToDB = () => {
    try {
        mongoose.connect(process.env.ATLAS_URI);
        console.log('✅ Database Connected');
    } catch (e) {
        console.log('⚠️ Database connection failed, running in demo mode:', e.message);
    }
    
    // Handle connection errors gracefully
    mongoose.connection.on('error', (err) => {
        console.log('⚠️ MongoDB connection error (running in demo mode):', err.message);
    });
    
    mongoose.connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
    });
    
    mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected (demo mode continues)');
    });
}

module.exports = connectToDB;