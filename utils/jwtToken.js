// creating token and saving it in the cookie
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken()

    // options for cookie
    const options = {
        // this expires shows the expiry time of the token store in the cookie which will result in the logout of the account
        expires: new Date(
            // date is taken from env file in the form of days and converted into milliseconds
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    }

    // cookie need value of token and options
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    })
}
module.exports = sendToken