const jwt = require('jsonwebtoken');
const { createUser, getUserByPhone } = require('../models/userModels');
require('dotenv').config();

/**
 * Generate JWT for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Register new user
 */
async function registerUser(req, res) {
  try {
    const { name, phone, role } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    // Check if user already exists
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered with this phone number.' });
    }

    // Create new user
    const newUser = await createUser(name, phone, role || 'rider');

    // Generate JWT
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully ✅',
      user: newUser,
      token,
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

/**
 * Login (simple mock for now)
 * In future, replace with OTP verification or password auth
 */
async function loginUser(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const existingUser = await getUserByPhone(phone);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const token = generateToken(existingUser);
    res.json({
      message: 'Login successful ✅',
      user: existingUser,
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
}

module.exports = { registerUser, loginUser };
