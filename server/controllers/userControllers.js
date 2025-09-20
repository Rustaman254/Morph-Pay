const { ec, stark } = require('starknet');

const register = async (req, res) => {
  try {
    const { phone, password, username } = req.body;

    if (!phone || !password || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Correct (v7+) private key generation:
    const privateKey = stark.randomPrivateKey();
    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    const newUser = {
      phone,
      username,
      starknetPublicKey: publicKey,
      privateKey // For demo only; never send this in production
    };
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register };
