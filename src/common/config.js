const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

module.exports = {
  API_URL: process.env.API_URL,
};
