require('dotenv').config();
const mongoose = require('mongoose');

const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.ATLAS_URI);
        console.log('Database Connected');
    }
    catch(e){
        console.log('Database connection failed - running without database:', e.message);
    }
}
module.exports = connectToDB;