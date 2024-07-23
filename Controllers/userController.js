const asyncHandler = require("express-async-handler");
const User = require("../Models/user");
const generateToken = require("../utils/generateToken");
const uploadOptions = require("../Middleware/multerMiddleware");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const config = {
    service: "gmail",
    host: "smtp.gmail.com", // Correct the typo in 'smtp.gmail.com'
    port: 587,
    secure: false,
    auth: {
      user: "sohail.zaryab61@gmail.com",
      pass: "afmr ofwg udnx apno"
    }
  }

  
const send = (data) => {
    const transporter = nodemailer.createTransport(config);
    transporter.sendMail(data, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        return info.response;
      }
    });
  };

  exports.postEmail = async (req, res, next) => {
    const { from, to, subject, text } = req.body;
    const data = { from, to, subject, text };
    
    // Call the 'send' function defined above
    send(data);
  
    res.send("Email sent"); // You can send a response here or handle it as needed.
  };
   
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
          // Send email notification
        const emailData = {
            from: config.auth.user,
            to: savedUser.email,
            subject: 'Welcome to Our Service!',
            text: `Hi ${savedUser.name},\n\nThank you for signing up!\n\nBest regards,\nYour Company`
          };
          send(emailData);
          res.status(201).json({ message: "User SignUp Successfully", user: savedUser });
        } else {
          res.status(400).json({ message: "Invalid User Data" });
        }
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  });
  
//@desc Login user
//route POST /api/users/login
//@access Public
//api http://localhost:5000/api/users/login

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign(
        {
            userId: user.id,
            //admin user can only use the token to process operation not user
            role: user.role
        },
        process.env.
        JWT_SECRET,
        {expiresIn : '1d'}
    ) 
    res.status(200).send({user: user.email , token: token, role: user.role}) 
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    res.send("User Login Successfully");
  });

  
//@desc Logout user / clear cookie
//route POST /api/users/logout
//@access Private
//api http://localhost:5000/api/users/logout
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({
      message: "Logged out successfully",
    });
  });

//@desc Get students lists in database we have 2 type data student and teacher they only show students data to teacher 
//route GET /api/users/student profile
//@access Private only teacher see
//api http://localhost:5000/api/users/studentList

const studentList = asyncHandler(async (req, res) => {
    try {
      // Query for users with role 'student'
      const students = await User.find({ role: 'student' });
  
      // Check if any students were found
      if (!students || students.length === 0) {
        return res.status(404).json({ message: "No students found" });
      }
  
      // Send the list of students as the response
      res.status(200).json(students);
    } catch (error) {
      // Handle any errors
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = {
    signUp,
    login,
    logoutUser,
    studentList
}