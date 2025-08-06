require('dotenv').config();
const mongoose = require('mongoose');
const connectToDb = require('../config/connectToDB');
const { seedMeatRecommendations } = require('./sampleMeatRecommendations');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Connect to database
        await connectToDb();
        console.log('✅ Connected to database');
        
        // Seed meat recommendations
        await seedMeatRecommendations();
        console.log('✅ Meat recommendations seeded');
        
        console.log('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };