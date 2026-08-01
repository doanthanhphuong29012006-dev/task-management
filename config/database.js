const mongoose = require('mongoose');

module.exports.connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Successfully connected to the database!")
    } catch (error) {
        console.log("Database connection failed");
    }
}