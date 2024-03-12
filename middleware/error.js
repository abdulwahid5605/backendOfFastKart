const  ErrorHander= require("../utils/errorHander")

// Error Handling
// Cast Error: it occurs when the id of the product is given less then the total number of digits
// user can give the wrong id by writing all digits and less digits as well
// In simple Cast Error is Wrong mongodb id error

// Mongoose duplicate key error
// We have assigned "true" to "unique" property of email. Hence, there will be no duplicate emails 
// But the message genereted is not user friendly when person enter same email twice
// using the code of that error we will be performing error handling


module.exports=(err,req,res,next)=>{
    err.statuscode=err.statuscode || 500
    // console.log(err.statuscode)
    err.message=err.message || "Internal server error"
    // console.log(err.message)

    // Wrong mongodb id Error
    if (err.name=="CastError")
    {
        // 400 port number shows the bad request
        const message=`Resource not found. Invalid ${err.path}`
        err=new ErrorHander(message,400)
    }

    // duplicate email error during "register user api"
    if(err.code===11000)
    {
        // person can not enter the duplicate email, he/she can enter other similar field like password etc
        // object key value is passed
        const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
        err=new ErrorHander(message,400)
    }

    if(err.name==="JsonWebTokenError")
    {
        const message=`Json Web Token is Invalid, Try Again`
        err=new ErrorHander(message,400)
    }

    if(err.name==="TokenExpiredError")
    {
        const message=`Json Web Token is Expired, Try Again`
        err=new ErrorHander(message,400)
    }


    res.status(err.statuscode).json({
        success:false,
        // using stackCaptureTrace function to identify the path
        // error:err.stack,
        message:err.message,
        // message:err.message
    })
}