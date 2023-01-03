const mongoose = require('mongoose')
const Products = require('../models/productModel')
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  phonenumber: {
    type: String,
    required: true,
    trim: true,
    minLength: 10
  },
  country:{
    type:String,
    
},
address:{
  type:String,
  
},
city:{
  type:String,
  
}, state:{
  type:String,
  
},
zip:{
  type:String,

},
  password: {
    type: String,
    required: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  cart:{
    item:[{
        productId:{
            type:mongoose.Types.ObjectId,
            ref:'Products',
            required:true
        },
        qty:{
            type:Number,
            required:true
        },
        price:{
            type:Number
        },
    }],
    totalPrice:{
        type:Number,
        default:0
    }
},
wishlist: {
   item:[{
     productId:{
      type:mongoose.Types.ObjectId,
      ref:'Products',
      required:true
     }
   }]
}
 
})
userSchema.methods.addToCart = function (product,quantity) {
  const cart = this.cart
  
  const isExisting = cart.item.findIndex(objInItems => {
      return new String(objInItems.productId).trim() == new String(product._id).trim()
  })
  if(isExisting >=0){
      cart.item[isExisting].qty +=quantity.a
  }else{
      cart.item.push({productId:product._id,
      qty:quantity.a,price:product.offer})
  }
  cart.totalPrice += product.offer*quantity.a

  return this.save()
}


userSchema.methods.removefromCart =async function (productId){
  const cart = this.cart
  const isExisting = cart.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productId).trim())
  if(isExisting >= 0){
      const prod = await Products.findById(productId)
      cart.totalPrice =cart.totalPrice- ( prod.offer * cart.item[isExisting].qty)
      cart.item.splice(isExisting,1)
     
      return this.save()
  }
}
userSchema.methods.addToWishlist = function (productid) {
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productid).trim())
  if(isExisting <0){
      wishlist.item.push({productId:productid,
      })
     
  }
  
  return this.save()

}


userSchema.methods.removeFromWishlist =async function (productid){
  const wishlist = this.wishlist
  const isExisting = wishlist.item.findIndex(objInItems => new String(objInItems.productId).trim() === new String(productid).trim())
  if(isExisting >= 0){
   
     
    wishlist.item.splice(isExisting,1)
     
      return this.save()
  }
}
module.exports = mongoose.model('users', userSchema)