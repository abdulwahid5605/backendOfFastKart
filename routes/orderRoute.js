const express=require("express")
const router=express.Router()
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const { createOrders, getAllOrders, deleteOrder, updateOrder, getSingleOrder, myOrders } = require("../controller/orderController");

// user must be logged in to create any order
router.route("/order/new").post(isAuthenticatedUser,createOrders)

// user must be logged in to get single order
router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder)

// if the logged in user want to get his orders
router.route("/orders/me").get(isAuthenticatedUser,myOrders)

// -------------------------------- Admin Route ---------------------------------------
// get api for all orders
router.route("/orders").get(isAuthenticatedUser, authorizedRoles("admin"), getAllOrders);

// delete api for deleting order
router.route("/admin/order/:id").delete(deleteOrder,isAuthenticatedUser,authorizedRoles("admin"))

// update order api
router.route("/admin/order/:id").put(updateOrder,isAuthenticatedUser,authorizedRoles("admin"))



module.exports=router