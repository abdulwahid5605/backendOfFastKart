// first word of class is always capital
// ErrorHander is extended class of Error(a built in node class)
class ErrorHander extends Error {
  constructor(message,statuscode) {
    // error is generated because it is necessary to call a super class first before accessing this  
    // this.message=message;
    
    super(message);
    
    // super(statuscode)
    // console.log(statuscode)
    // this.message=message

    this.statuscode = statuscode;
    
    // where this is an object below
    // stack capture trace is a function that provides the path of error like from where the error is arising
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHander;
