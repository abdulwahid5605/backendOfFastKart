// "router" is provided by "express js"
// so importing express js
const express = require("express");
const {} = require("../controller/productController");
const { authorizedRoles, authenticateUser } = require("../middleware/auth");
const {
  createCategory,
  getAllCategories,
  updateCategory,
} = require("../controller/categoryController");

// storing "router of express" js in "router" variable
const router = express.Router();

// routes are used to control http requests
// get request
router.route("/category").get(getAllCategories);

router.route("/category/create").post(createCategory);
router.route("/category/:id").put(updateCategory);
module.exports = router;
