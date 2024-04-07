// "router" is provided by "express js"
// so importing express js
const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  productReviews,
  getProductReviews,
  deleteReviews,
} = require("../controller/productController");
const { authorizedRoles, authenticateUser } = require("../middleware/auth");

// storing "router of express" js in "router" variable
const router = express.Router();

// routes are used to control http requests
// get request
router.route("/product").get(getAllProducts);

// post request
// to create a product role should be 'admin(authorizedRole)' and user should be logged in
router.route("/product/create").post(createProduct);
// .post(authenticateUser, authorizedRoles("admin"), createProduct);

// put request+ delete request + get request
// all apis need the id to work, so same url, applying api on the same url
router
  .route("/product/:id")
  .put(authenticateUser, authorizedRoles("admin"), updateProduct)
  .delete(authenticateUser, authorizedRoles("admin"), deleteProduct);

router
  .route("/product/:id")
  .get(authenticateUser, authorizedRoles("admin"), getProductDetails);

// ----------------------Reviews Of Product------------------------
// product reviews put api
router.route("/reviews").put(productReviews);

// Get All reviews Api
router.route("/reviews").get(getProductReviews);

// deleting review api
// it is necessary to be logged in to delete your review
router.route("/reviews").delete(deleteReviews);
// this router is imported in app.js
module.exports = router;
