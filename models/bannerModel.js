const mongoose = require('mongoose')

const BannerSchema = mongoose.Schema({
  banner: {
    type: String,
    required: true

  },
  banerimage: {
    type: Array,
    required: true
  },
  isActive:{
    type:Number,
    default:0
  }

})

module.exports = mongoose.model('Banner', BannerSchema)
