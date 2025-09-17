require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET, // Change to strong secret or load from .env in production
  expiresIn: '1h'
};
