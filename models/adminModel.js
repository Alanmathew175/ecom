const mongoose = require('mongoose')

const adminSchema = mongoose.Schema({
  email: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Admin', adminSchema)
