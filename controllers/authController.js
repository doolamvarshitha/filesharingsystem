const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Sign-up
exports.signUp = async (req, res) => {
  const { username, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const verification_code = crypto.randomBytes(20).toString('hex');
  
  const newUser = new User({ username, email, password: hashedPassword, role });
  await newUser.save();

  // Send verification email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'your-email@gmail.com', pass: 'your-email-password' }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: newUser.email,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the following link: ${process.env.HOST}/verify-email/${verification_code}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).json({ error: 'Failed to send email' });
    res.status(201).json({ message: 'User created. Check your email for verification link' });
  });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
};

// Email Verification
exports.verifyEmail = async (req, res) => {
  const { verification_code } = req.params;
  const user = await User.findOne({ verification_code });
  if (!user) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  user.email_verified = true;
  await user.save();
  res.json({ message: 'Email verified successfully' });
};
