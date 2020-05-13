const dotEnv = require('dotenv');
dotEnv.config();
module.exports = {
  database: process.env.DB,
  secret: process.env.DB_SECRET
}
