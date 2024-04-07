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
  const { name, email, password, confirm_password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// -----------LOGIN-------------------
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    }); // Replace 'your_secret_key' with your actual secret key

    // Set token in a cookie
    res.cookie("token", token, { httpOnly: true }); // You can set other options like secure, sameSite, etc. as needed

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; // -----------LOGOUT-------------------

exports.logoutUser = async (req, res) => {
  try {
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

    const resetToken = crypto.randomBytes(20).toString("hex");

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        reset_password_token: resetToken,
        reset_password_expire: new Date(Date.now() + 3600000),
      },
    });

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
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const token = req.params.token;

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

    if (
      user.reset_password_token !== token ||
      user.reset_password_expire < new Date()
    ) {
      return res.status(400).json({
        status: 400,
        message: "Invalid or expired reset token",
      });
    }

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: newPassword,
        reset_password_token: null,
        reset_password_expire: null,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    // Fetch user details using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// PUT /api/user/password
exports.updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "Current password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// Api to update email and name
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const newName = req.body.name;
  console.log(newName);

  try {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: newName,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "User name updated successfully",
    });
  } catch (error) {
    console.error("Error updating user name:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// --------------------------------Admin Routes---------------------------------

// get api
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

// Admin Api for getting a single user
exports.getSingleUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
};

// updating user profile with the help of user id
exports.UpdateUserRole = async (req, res, next) => {
  try {
    // Admin should not be able to change the profile picture of user
    const newUserData = {
      email: req.body.email,
      name: req.body.name,
      role: req.body.role,
    };

    // Update user role using Prisma
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: newUserData,
    });

    res
      .status(201)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    // Disconnect from Prisma client
    await prisma.$disconnect();
  }
};

// it also requires the "id"
exports.deleteUser = async (req, res, next) => {
  try {
    // Find user by ID using Prisma
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });

    // Check if user exists
    if (!user) {
      return next(new Error(`User with the id ${req.params.id} not found`));
    }

    // Delete user using Prisma
    await prisma.user.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res
      .status(201)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  } finally {
    // Disconnect from Prisma client
    await prisma.$disconnect();
  }
};

// Create User
exports.addUser = async (req, res) => {
  const { name, email, phone, password, confirm_password, role, status } =
    req.body;

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        phone: phone, // Including phone in the data
        password: hashedPassword,
        role: role,
        status: status,
      },
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// In Admin Dashboard
exports.createUserAdmin = async (req, res, next) => {
  const {
    name,
    email,
    password,
    confirm_password,
    storeName,
    country,
    state,
    city,
    address,
    pincode,
    phoneNumber,
  } = req.body;

  // Check if password and confirm_password match
  if (password !== confirm_password) {
    return res
      .status(400)
      .json({ error: "Password and confirm password do not match" });
  }

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user using Prisma
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        storeName,
        country,
        state,
        city,
        address,
        pincode,
        phoneNumber,
      },
    });

    // Send the newly created user in the response
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
