const prisma = require("../DB/db.config");

const ErrorHander = require("../utils/errorHander");

// concising code
const sendToken = require("../utils/jwtToken");

const catchAsyncErrors = require("../middleware/catchAsyncError");
const { sendEmail } = require("../utils/sendEmail");

const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store token in cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour

    return res.status(200).json({
      status: 200,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
// -----------LOGIN-------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        status: 400,
        message: "Invalid password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store token in cookie
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
// -----------LOGOUT-------------------

exports.logoutUser = async (req, res) => {
  try {
    // Clear the token cookie by setting it to an empty string and setting the expiration time to a past date
    res.cookie("token", "", { expires: new Date(0) });

    return res.status(200).json({
      status: 200,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
// --------Forgot Password Api-------------
const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_SERVICE,
    to: email,
    subject: "E Commerce password Reset Request",
    text:
      `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `http://localhost:3000/reset/${token}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // If the user doesn't exist, return a 400 response
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "User not found",
      });
    }

    // Generate a unique reset password token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set the reset password token and expire time in the database
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        reset_password_token: resetToken,
        reset_password_expire: new Date(Date.now() + 3600000), // Expire in 1 hour
      },
    });

    // Send email with the reset password token
    await sendResetEmail(email, resetToken);

    return res.status(200).json({
      status: 200,
      message: "Reset password email sent",
    });
  } catch (error) {
    console.error("Error generating reset password token:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};
// ---------Reset Password Api-----------
exports.resetPassword = catchAsyncErrors(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log(token);

  // Check if the token is valid and not expired
  const user = await pool.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > CURRENT_TIMESTAMP",
    [token]
  );

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  // Update user password with hashed password
  await pool.query(
    "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE reset_password_token = $2",
    [hashedPassword, token]
  );

  res.status(200).json({ message: "Password updated successfully" });
});
// -----------These apis are used to update the password and profile of the user--------------
// Api similar to getProductDetails
// get Api
// using id stored in req.user during the log in function we will get the details of the user
// Note: The user is already logged in
// so we do not need to seperately make an if condition that if the user is not found then? Because this api can be accessed only when the user is already logged in
// question arises why we are searching for the user?
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  // "req.user" consist of decodedData of user we have assigned in "isAuthenticatedUser"
  // decoded data also has the id of user
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});

// update password put Api
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  // 3 thing required
  // existing password
  // new password
  // confirmation of new password

  const oldPassword = req.body.oldPassword;

  // we can not directly access the password of schema because its select property is false
  // user ki id se niaklna ha password
  // id kay liye pehlay login hona zaruri matla athentication bhi lagni ha

  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  // if user is not saved then?
  await user.save();

  sendToken(user, 201, res);
});

// Api to update email and name
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  // we have to take the updated email and name of the user
  // note: user is already logged in
  // const email=req.body.email
  // const name=req.body.name

  // we also have to add "avatar" but we will add it when working with cloudinary

  const newUserData = { email: req.body.email, name: req.body.name };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
  });
});

// --------------------------------Admin Routes---------------------------------
// Admin can see all of the users created -- get request
// Admin can see a specific user with the help of id -- get request
// Admin should be able to update the role, name and email of any user -- put request
// Admin should be able to delete any user -- delete request

// get api
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ success: true, users });
});

// get api
// id of user is required
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User with the id ${req.params.id} not found`, 400)
    );
  }

  res.status(200).json({ success: true, user });
});

// updating user profile with the help of user id
exports.UpdateUserRole = catchAsyncErrors(async (req, res, next) => {
  // Admin should not be able to change the profile picture of user
  const newUserData = {
    email: req.body.email,
    name: req.body.name,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    useFindAndModify: false,
    runValidators: true,
  });

  await user.save();
  res
    .status(201)
    .json({ success: true, message: "User upadated successfully" });
});

// admin deleting the user
// it also requires the "id"
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User with the id ${req.params.id} not found`, 400)
    );
  }

  await user.remove();

  res.status(201).json({ success: true, message: "User deleted successfully" });
});
