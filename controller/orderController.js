const Order= require("../models/orderModels")
const ErrorHander=require("../utils/errorHander")
const catchAsyncErrors=require("../middleware/catchAsyncError")
const Product=require("../models/productModels")

// creating orders
// it will be a post request
// only login us required

exports.createOrders=catchAsyncErrors(async(req,res,next)=>{
    // taking input from body
    // destructuring
    const {shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body

    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id 
        // createdAt
        // deliveredAt
        // order status
    })

    res.status(201).json({
        success:true,
        order 

    })
})

// get single order api
// both for admin and user but necessary to be logged in
exports.getSingleOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)
    if(!order){
        next(new ErrorHander(`Order with the id: ${req.params.id} not found`))
    }

    res.status(200).json({
        success:true,
        order
    })
})


// get logged in user order or my orders
// In Schema we have passed the reference of the user who have created the order
// using the id(user._id) of that user we will find the required orders
exports.myOrders=catchAsyncErrors(async(req,res,next)=>{
    // fetching orders using id of user
    const order=await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        order
    })
})

// ----------------------------Admin Apis------------------------------

// admin api 
// only admin can view all of the orders
// get all orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();
  
    // the admin should be able to view the total amount of all Orders
    // total amount is the sum of all orders
    let totalAmount=0
    orders.forEach(order=>totalAmount=totalAmount+order.totalPrice)
  
    res.status(200).json({
      success: true,
      orders,
      totalAmount
    });
  });

// admin deleting order api
exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)
    if(!order)
    {
        return next(new ErrorHander(`Order with the id ${req.params.id} not found`))
    }

    await order.remove()

    res.status(204).json({
        success:true,
        message:"Order deleted successfully"
    })
})

// Admin Api to update order
exports.updateOrder=exports.deleteOrder=catchAsyncErrors(async(req,res,next)=>{
    // what do we have to update?
    // we have to update the orderStatus from "processing" to "delivered"
    // and when the product is delivered we have to reduce the amount of stock on the basis of quantity that user have ordered

    // admin will require the id of the order to update it obviously 
    const order=await Order.findById(req.params.id)

    if(!order)
    {
        return next(new ErrorHander(`Order with the id ${req.params.id} not found`))
    }

    if(order.orderStatus==="Delivered")
    {
        return next(new ErrorHander(`Order with the id ${req.params.id} is already delivered`))
    }


    // what if the order status is shipped?
    // the product stock will be reduced using the quantity schema of order
    if(order.orderStatus==="Shipped")
    {
        order.orderItems.forEach(async(order)=>
            //product contains id of the product that is ordered   
            await updateStock(order.product,order.quantity))
    }

    // We also have to update the Shipped status in our orderStatus schema
    order.orderStatus=req.body.orderStatus 

    // during the delivery we just have updated the time of delivery
    if(req.body.orderStatus==="Delivered")
    {
        order.deliveredAt=Date.now()
    }

    // We also have to update the Delivered status in our orderStatus schema
    await order.save({validateBeforeSave:true})

    res.status(201).json({
        success:true,
    })

     // updateStock function
     async function updateStock(id,quantity){
        // firstly find the product
        const product = await Product.findById(id)
        // stock-quantityOrdered
        product.stock=product.stock-quantity

        // saving the updation in the db
        product.save({validateBeforeSave:true})
    }
    
})