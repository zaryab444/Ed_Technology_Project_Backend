const express = require("express");
const { signUp, login, logoutUser, studentList } = require("../Controllers/userController");
const { protect, teacher } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post('/signup', signUp);

router.post('/login', login);

router.post('/logout', logoutUser);

// router.get('/studentList', studentList)
router.route('/studentList').get(protect, teacher, studentList);




module.exports = router;