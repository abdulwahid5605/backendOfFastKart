module.exports=(TheFunc)=>(req,res,next)=>
{
    // Promise is built in class of javaScript: It will act as a try block and simply execute the api
    Promise.resolve(TheFunc(req,res,next)).catch(next) 
}