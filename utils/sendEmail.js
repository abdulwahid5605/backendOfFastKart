// options is an array and is holding message, email of customer and subject(not necessary) 

// "nodemailer" sends the mail on behalf of the admin automatically
// to send the mail you have to enable the "2 step verification" from your "security" of google account 
const nodemailer=require("nodemailer")
exports.sendEmail=async(options)=>{

    // createTransport function is used to authenticate the id of admin and we declare who will send the mail
    const transporter =nodemailer.createTransport({
        // in case gmail is not working we have to add the host and port of gmail
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // we can send the mail using many services such as gmail, yahoo etc
        service:process.env.SMTP_SERVICE,
        // authentication consist of the "email" and "password" of the "admin". We will be using the gmail id of "admin" to send the mail to other users 
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASS,
        }
    })

    // it is passed to the sendMail builtin function of nodemailer
    const mailOptions={
        from:process.env.SMTP_SERVICE,
        to:options.email,
        subject:options.subject,
        text:options.message
    }


    // sendMail function recieves the admin email, user email, subject and message being sent through array 
    await transporter.sendMail(mailOptions)
}