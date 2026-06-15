const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    console.log("STEP 1 - Request received");

    const { name, email, password, phone } = req.body;

    console.log("STEP 2 - Checking existing user");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    console.log("STEP 3 - Creating user");

    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    console.log("STEP 4 - User created");

    const verifyToken = user.generateEmailVerificationToken();

    console.log("STEP 5 - Token generated");

    await user.save();

    console.log("STEP 6 - User saved");

    try {
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verifyToken}`;

      console.log("STEP 7 - Sending email");

      await sendEmail({
        to: user.email,
        subject: "🌸 Welcome to Lily's Lab - Verify Your Email",
        template: "welcome",
        data: {
          name: user.name,
          verifyUrl
        }
      });

      console.log("STEP 8 - Email sent");
    } catch (emailError) {
      console.error("EMAIL ERROR:", emailError);
    }

    console.log("STEP 9 - Generating JWT");

    const token = generateToken(user._id);

    console.log("STEP 10 - Sending response");

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please verify your email.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }
    
    user.lastLogin = Date.now();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'title images price discountPrice');
  res.json({ success: true, user });
};

// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }
    
    const resetToken = user.generateResetToken();
    await user.save();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: "🌸 Lily's Lab - Password Reset Request",
      template: 'resetPassword',
      data: { name: user.name, resetUrl }
    });
    
    res.json({ success: true, message: 'Password reset email sent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};