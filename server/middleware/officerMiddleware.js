
const officerMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "officer") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Officers only.",
    });
  }

  next();
};

module.exports = officerMiddleware;
