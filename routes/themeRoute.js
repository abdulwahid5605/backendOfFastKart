// "router" is provided by "express js"
// so importing express js
const express = require("express");
const { getTheme } = require("../controller/themeController");

const router = express.Router();

// router.route("/createtheme").post(createTheme);
router.route("/theme").get(getTheme);

module.exports = router;
