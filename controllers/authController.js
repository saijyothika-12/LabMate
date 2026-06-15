const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
  const { name, email, password, branch, semester } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = await User.create({ 
      name, 
      email, 
      password, 
      branch: branch || "EEE", 
      semester: semester ? Number(semester) : 1 
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };