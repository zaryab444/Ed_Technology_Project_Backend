const express = require("express");
const { signUp } = require("../Controllers/userController");
const router = express.Router();

router.post('/signup', signUp);

module.exports = router;