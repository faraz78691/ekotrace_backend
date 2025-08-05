const jwt = require("jsonwebtoken");
const { getData } = require("../models/common");

const JWT_SECRET = 'my-32-character-ultra-secure-and-ultra-long-secret'

const auth = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["auth"];

    if (typeof bearerHeader !== undefined) {
      const bearer = bearerHeader.split(" ");
      req.token = bearer[1];
      const verifyUser = jwt.verify(req.token, JWT_SECRET);
      if (verifyUser && verifyUser.user_id) {
        req.user = verifyUser;
        let where = 'WHERE Id = "' + verifyUser.user_id + '"';
        const userFind = await getData("\`dbo.tenants\`", where);
        if (userFind.length > 0) {
          next();
        } else {
          return res.status(408).json({
            message: "Access Forbidden",
            status: 408,
            success: false,
          });
        }
      } else {
        return res.status(408).json({
          message: "Access Forbidden",
          status: 408,
          success: false,
        });
      }
    } else {
      return res.status(408).json({
        message: "Token Not Provided",
        status: 408,
        success: false,
      });
    }
  }
  catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(408).json({
      message: "Access Forbidden",
      status: 408,
      success: false,
      error: err.message,
    });
  }
};

module.exports = auth;