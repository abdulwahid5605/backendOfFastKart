const express = require("express");
const { authorizedRoles, authenticateUser } = require("../middleware/auth");
const {
  createProductAttribute, getProductAttribute, getSingleProductAttribute,
} = require("../controller/productAttributeController");
const router = express.Router();

router
  .route("/attribute/create")
  .post(authenticateUser, authorizedRoles("admin"), createProductAttribute);

  router
  .route("/attribute")
  .get(authenticateUser, authorizedRoles("admin"), getProductAttribute);

  router
  .route("/attribute/create")
  .post(authenticateUser, authorizedRoles("admin"), getSingleProductAttribute);

  router
  .route("/attribute/create")
  .post(authenticateUser, authorizedRoles("admin"), createProductAttribute);

module.exports = router;
