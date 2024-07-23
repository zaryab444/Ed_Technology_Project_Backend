const asyncHandler = require("express-async-handler");
const User = require("../Models/user");
const generateToken = require("../utils/generateToken");
const uploadOptions = require("../Middleware/multerMiddleware");


//@desc Register user
//route POST /api/users
//@access Public
//api http://localhost:5000/api/users/signup
const signUp = asyncHandler(async (req, res) => {
    uploadOptions(req, res, async (err) => {
      if (err) {
        // Handle errors thrown by Multer
        return res.status(500).send(err.message);
      }
  
      // File upload is successful, continue with creating the user
      const file = req.file;
      if (!file) {
        return res.status(400).send("No image in the request");
      }
  
      const fileName = req.file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  
      // Check if the user already exists
      const userExist = await User.findOne({ email: req.body.email });
      if (userExist) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      console.log(req.body);
  
      // Create a new user
      let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age,
        image: `${basePath}${fileName}`,
        role: req.body.role,
        secretCode: req.body.secretCode
      });
  
      try {
        // Save the user to the database
        const savedUser = await user.save();
  
        if (savedUser) {
          // Generate token and send response
          generateToken(res, savedUser._id);
          res.status(201).json({ message: "User SignUp Successfully", user: savedUser });
        } else {
          res.status(400).json({ message: "Invalid User Data" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  });
  
  


module.exports = {
    signUp
}