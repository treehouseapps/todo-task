const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ["free", "taken", "completed"],
    default: "free"
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  uploadedBy: { 
    type: String,
    required: true
  } 
})

const Task = new mongoose.model('task', taskSchema)

module.exports = Task