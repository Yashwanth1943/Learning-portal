const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user matching token ID
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        return res.json({ message: "Not authorized, student profile not found" });
      }

      if (!req.user.isActive) {
        res.status(403);
        return res.json({ message: "Access denied, user account deactivated" });
      }

      next();
    } catch (error) {
      res.status(401);
      return res.json({ message: "Not authorized, token signature validation failed" });
    }
  } else {
    res.status(401);
    return res.json({ message: "Not authorized, bearer token missing" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    return res.json({ message: "Access denied, admin permission required" });
  }
};

module.exports = { protect, admin };
