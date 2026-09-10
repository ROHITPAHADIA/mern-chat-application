const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT token for authenticated users
 * @param {string} id - The MongoDB User ID
 * @returns {string} - Signed JWT token valid for 30 days
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_key_12345", {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
