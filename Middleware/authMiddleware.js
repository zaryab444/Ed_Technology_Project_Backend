const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../Models/user");

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        // Extract the token from the Authorization header
        const token = authHeader.split(" ")[1];
  
        // Verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
        // Find the user by ID from the decoded token and attach it to the request object
        req.user = await User.findById(decoded.userId).select("-password");
  
        if (!req.user) {
          return res.status(401).json({ message: "User not found" });
        }
        next(); // Proceed to the next middleware or route handler
      } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
      }
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  };
  

const teacher = (req, res, next) => {
  if (req.user.role === 'teacher') {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as teacher" });;
  }
};

module.exports = { protect, teacher };
