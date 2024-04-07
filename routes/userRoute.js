const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  UpdateUserRole,
  deleteUser,
  addUser,
  createUserAdmin,
} = require("../controller/userController");
const { authenticateUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

// post request to register user
router.route("/register").post(registerUser);

// post api to login user
router.route("/login").post(loginUser);

// get Api
router.route("/logout").get(logoutUser);

// forgot password api
router.route("/password/forgot").post(forgotPassword);

// update password api put request
router.route("/password/reset/:token").put(resetPassword);

// get api
// it is necessary to be logged in to access getUserDetails
router.route("/me").get(authenticateUser, getUserDetails);

// put api to update password
router.route("/password/update").put(authenticateUser, updatePassword);

// put api to update email and username
router.route("/me/update").put(authenticateUser, updateProfile);

// ----------------Admin Routes-------------------------------
// get all users
router
  .route("/admin/users")
  .get(authenticateUser, authorizedRoles("admin"), getAllUsers);

// get single users
router
  .route("/admin/:id")
  .get(authenticateUser, authorizedRoles("admin"), getSingleUser);

// update user role
router
  .route("/admin/:id")
  .put(authenticateUser, authorizedRoles("admin"), UpdateUserRole);

// delete user
router
  .route("/admin/:id")
  .delete(authenticateUser, authorizedRoles("admin"), deleteUser);

router
  .route("/user/create")
  .post(authenticateUser, authorizedRoles("admin"), addUser);

router.route("/auth/admin/register").post(createUserAdmin);

module.exports = router;
