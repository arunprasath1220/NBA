const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID Token
const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Google token verification failed:", error);
    throw new Error("Invalid Google token");
  }
};

// Google Login Controller
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }

    // Verify the Google token
    const googleUser = await verifyGoogleToken(credential);
    const { email, name, sub: googleId } = googleUser;

    // Check if user exists in database
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );

    // Only allow existing users
    if (existingUsers.length === 0) {
      return res.status(403).json({ 
        error: "User not registered. Please contact admin to register." 
      });
    }

    const user = existingUsers[0];

    // Get user roles
    const [roles] = await pool.execute(
      `SELECT r.name FROM role r 
             INNER JOIN user_role ur ON r.id = ur.role_id 
             WHERE ur.user_id = ?`,
      [user.id],
    );

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: name || user.email.split("@")[0],
        roles: roles.map((r) => r.name),
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Set cookie with JWT
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: name || user.email.split("@")[0],
        roles: roles.map((r) => r.name),
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Get current user from JWT cookie
const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fresh user data from database
    const [users] = await pool.execute(
      "SELECT id, email, is_active FROM users WHERE id = ?",
      [decoded.userId],
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Get user roles
    const [roles] = await pool.execute(
      `SELECT r.name FROM role r 
             INNER JOIN user_role ur ON r.id = ur.role_id 
             WHERE ur.user_id = ?`,
      [user.id],
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: decoded.name,
        roles: roles.map((r) => r.name),
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
};

// Logout - clear cookie
const logout = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

// Middleware to verify JWT from cookie
const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = {
  googleLogin,
  getCurrentUser,
  logout,
  authenticateToken,
};
