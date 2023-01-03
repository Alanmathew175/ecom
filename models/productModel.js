const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true

  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    trim: true
  },
  offer: {
    type: Number,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: Array
  },

  stock: {
    type: Number,
    required: true,
    trim: true
  },
  status: {
    type: String,
    default: 1
  },
  brand:{
    type:String,
    required:true,
    trim:true
  },




})
module.exports = mongoose.model('Products', productSchema)
