require('dotenv').config();

module.exports = {
  MongoURI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};
