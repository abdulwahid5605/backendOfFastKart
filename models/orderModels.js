// Order Models Structure will help when someone will click on the checkout button in the front end
// the person will provide the address where the order will be delivered
// State: you can say districts
// OrderModel includes:
// 1-shippingAddress: address, city, state, country, pinCode, phoneNo
// 2-orderItems: Name of Product, Quantity of Product, Price of product, Image of product, Reference of that product 
// 3-user:the one trying to order
// 4-paymentInfo: paid or unpaid
// 5- paid at
// 6-itemPrice
// 7-taxPrice
// 8-ShippingPrice
// 9-totalPrice
// 10-order status
// 11-delivered at which time
// 12-order created at which time created at

const mongoose=require("mongoose")

const orderSchema=new mongoose.Schema({
    shippingInfo:{
        address:{
            type:String,
            required:true 
        },
        city:{
            type:String,
            required:true 
        },
        state:{
            type:String,
            required:true 
        },
        country:{
            type:String,
            required:true 
        },
        // it is basically the postal code
        pinCode:{
            type:Number,
            required:true 
        },
        phoneNo:{
            type:Number,
            required:true 
        },
    },
    orderItems:[{
        // name of that product that you wonna order
        name:{
            type:String,
            required:true
        },

        // price of that product that you wonna order
        price:{
            type:Number,
            required:true 
        },

        // + - button in front end 
        quantity:
        {
            type:Number,
            required:true,
        },

        // image of that product that you wonna order
        image:{
            type:String,
            required:true
        },

        // reference of the product that you want to buy
        product:{
            type:mongoose.Schema.ObjectId,
            ref:"Product",
            required:true,
        },
    }],

    // The one who is trying to order
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true 
    },

    paymentInfo:{
        // every payment will have a unique id
        id:{
            type:String,
            required:true 
        },
        // paid or unpaid
        status:
        {
            type:String,
            required:true 
        }
    },

    // if payment is done then when the amount was paid
    paidAt:{
        type:Date,
        required:true
    },

    // types of prices: 1- items price, 2- tax price, 3-shipping price 4-total price(sum of all the three prices)
    
    itemsPrice:{
        type:Number,
        required:true 
    },

    taxPrice:{
        type:Number,
        required:true 
    },

    shippingPrice:{
        type:Number,
        required:true 
    },

    totalPrice:{
        type:Number,
        required:true 
    }, 

    // there can be three status of any order
    // 1- Processing, 2- Shipped(on the way), 3- Delivered 
    orderStatus:
    {
        type:String,
        required:true,
        default:"Processing"
    },

    // when the order was delivered
    deleiveredAt:Date,

    // when the order was created
    createdAt:{
        type:Date,
        required:true,
        default:Date.now
    }
})

module.exports=mongoose.model("Order",orderSchema)