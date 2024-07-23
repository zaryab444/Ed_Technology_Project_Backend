const asyncHandler = require("express-async-handler");
const User = require("../Models/user");
const generateToken = require("../utils/generateToken");

const multer = require("multer");
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage }).single("image");

//@desc Register user
//route POST /api/users
//@access Public
//api http://localhost:5000/api/users/signup
const signUp = asyncHandler(async (req, res) => {
    uploadOptions(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred during file upload
        return res.status(400).send(err.message);
      } else if (err) {
        // An unknown error occurred during file upload
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