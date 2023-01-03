const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
  categoryName: {
    type: String,
    trim: true,
    required: true
  }
})

module.exports = mongoose.model('Category', categorySchema)
