const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const ErrorHander = require("../utils/errorHander");
const prisma = new PrismaClient();

exports.authenticateUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: {
        id: decodedData.id,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  } finally {
    await prisma.$disconnect();
  }
};

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHander(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
