const mongoose = require("mongoose")

const user_schema = new mongoose.Schema({
  name: {
    type: String,
  }
})
const User = new mongoose.model('user', user_schema)

module.exports = User