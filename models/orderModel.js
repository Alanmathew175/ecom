const mongoose = require('mongoose')
const Products = require('../models/productModel')
const Users = require('../models/userModel')

const OrderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'Users',
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone: {
        type:String,
    
    },email:{
        type:String
    },
    payment:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    },
    products:{
        item:[{
            productId:{
                type:mongoose.Types.ObjectId,
                ref:'Products',
                
            },
            qty:{
                type:Number,
              
            },
            price:{
                type:Number,
            }
        }],
        totalPrice:{
            type:Number,
            default:0
        }
    },
    status:{
        type:String,
        default:"Attempted"
    },
    amount:{
        type:Number,
               
    },
    canceled:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model('orders', OrderSchema)