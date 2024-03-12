const express = require("express")
const { registerUser, loginUser, logoutUser, forgotPassword,  resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, UpdateUserRole, deleteUser } = require("../controller/userController")
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth")
const router = express.Router()

// post request to register user
router.route("/register").post(registerUser)

// post api to login user
router.route("/login").post(loginUser)

// get Api
router.route("/logout").get(logoutUser)

// forgot password api
router.route("/password/forgot").post(forgotPassword)

// update password api put request
router.route("/password/reset/:token").put(resetPassword)

// get api 
// it is necessary to be logged in to access getUserDetails
router.route("/me").get(isAuthenticatedUser,getUserDetails)

// put api to update password
router.route("/password/update").put(isAuthenticatedUser,updatePassword)

// put api to update email and username
router.route("/me/update").put(isAuthenticatedUser,updateProfile)

// ----------------Admin Routes-------------------------------
// get all users
router.route("/admin/users").get(isAuthenticatedUser,authorizedRoles("admin"),getAllUsers)

// get single users
router.route("/admin/:id").get(isAuthenticatedUser,authorizedRoles("admin"),getSingleUser)

// update user role
router.route("/admin/:id").put(isAuthenticatedUser,authorizedRoles("admin"),UpdateUserRole)

// delete user role
router.route("/admin/:id").delete(isAuthenticatedUser,authorizedRoles("admin"),deleteUser)


module.exports = router