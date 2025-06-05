const authService = require('../services/authService');

async function signup(req, res) {
  try {
    const response = await authService.signupUser(req.body);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const response = await authService.verifyOtp(req.body);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function setPassword(req, res) {
  try {
    const response = await authService.setPassword(req.body);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function login(req, res) {
  try {
    const response = await authService.loginUser(req.body);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function updateUserDetails(req, res) {
  try {
    const userId = req.user.id; // set by authenticateToken middleware
    const response = await authService.updateUserDetails(userId, req.body);
    res.status(200).json({ success: true, ...response });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  signup,
  verifyOtp,
  setPassword,
  login,
  updateUserDetails,
};