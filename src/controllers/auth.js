const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Create Access Token
    const accessPayload = { userId: user.id };
    const accessToken = jwt.sign(accessPayload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });

    // Create Refresh Token with unique jti
    const jti = crypto.randomUUID();
    const refreshPayload = { userId: user.id, jti };
    const refreshToken = jwt.sign(
      refreshPayload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      }
    );

    // Save Refresh Token
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      jti,
      expiresAt: new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS)
      ),
    });

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create Access Token
    const accessPayload = { userId: user.id };
    const accessToken = jwt.sign(accessPayload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });

    // Create Refresh Token with unique jti
    const jti = crypto.randomUUID();
    const refreshPayload = { userId: user.id, jti };
    const refreshToken = jwt.sign(
      refreshPayload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      }
    );

    // Save new Refresh Token (no deletion of other tokens)
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      jti,
      expiresAt: new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS)
      ),
    });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if jti exists in decoded token
    if (!decoded.jti) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token: missing jti" });
    }

    // Check if refresh token exists in DB
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, userId: decoded.userId, jti: decoded.jti },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Delete only the provided refresh token
    await RefreshToken.destroy({
      where: { token: refreshToken, userId: decoded.userId, jti: decoded.jti },
    });

    // Create new Access Token
    const accessPayload = { userId: decoded.userId };
    const newAccessToken = jwt.sign(
      accessPayload,
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    );

    // Create new Refresh Token with a new jti
    const newJti = crypto.randomUUID();
    const refreshPayload = { userId: decoded.userId, jti: newJti };
    const newRefreshToken = jwt.sign(
      refreshPayload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      }
    );

    // Save new Refresh Token
    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.userId,
      jti: newJti,
      expiresAt: new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_MS)
      ),
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
