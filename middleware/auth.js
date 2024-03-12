// authentication is done with the help of token stored in cookie
// if token is found in cookie then it means the user is logged in
// if cookie is not found then it means the user is not logged in

const jwt = require("jsonwebtoken")
const User = require("../models/userModels")
const catchAsyncError = require("./catchAsyncError")
const ErrorHander = require("../utils/errorHander")
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {

    // fetching the token from cookies
    // token is returned in the form of object
    // const token = req.cookies

    // we need only value of token
    const { token } = req.cookies
    // console.log(token)

    // what if the token is not found??
    if (!token) {
        next(new ErrorHander("Please login to access this resource", 401))
    }

    // using jwt token we will verify that the user is logged in or not
    // verify method takes token and secret key as a input
    // also we can access the "id" of the user now
    // converting of the token into orignal data

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)

    // until the user is logged in he can access the resources using request
    // "req.user" is used to store "user data" when logged in
    // it is simply a variable
    req.user = await User.findById(decodedData.id);

    next();
}) 

// checking either user role is "admin" or "user"
// role is converted into array using spread operator
exports.authorizedRoles=(...roles)=>{
    return (req,res,next)=>{
        // now comparing the admin with the role of user store in database
        // includes is function of an array to check either the value recieved is stored in an "role" of schema or not
        // roles= admin & req.user.role="user" this condition will run
        // roles= admin & req.user.role="admin" this condition will not run and skip
        // server understands what you are trying to do but refused to perform the function
        if(!roles.includes(req.user.role))
        {
            return next( new ErrorHander(`Role: ${req.user.role} is not allowed to access this resource`,403))
        }
        next()
    }
}