const { Account, Provider, ec } = require("starknet");
const bcrypt = require('bcrypt');
const bip39 = require('bip39');
const connectDB = require('../config/db');

const register = async (req, res) => {
    console.log('REQ BODY:', req.body);

    try {
        const { phone, password, username } = req.body;

        if (!phone || !password || !username) {
            return res.status(400).json({ error: 'Phone, password, and username are required' });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', detail: error.message });
    }
};

module.exports = {
    register,
};
