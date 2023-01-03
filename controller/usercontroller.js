const Users = require('../models/userModel')
const Banners = require('../models/bannerModel')
const Products = require('../models/productModel')
const Coupons = require('../models/couponModel')
const fast2sms = require('fast-two-sms')
const Paypal = require("paypal-rest-sdk");
const cors = require('cors')
const Razorpay = require('razorpay')
const Orders = require('../models/orderModel')
const express = require('express')
const app = express()
app.use(express.json())
app.use(cors())

let newUser
let newOtp

const sendMessage = function(mobile,res){
  let randomOTP = Math.floor(Math.random()*10000)
  var options = {
      authorization:"MSOj0bTnaP8phCARmWqtzkgEV4ZN2Ff9eUxXI7iJQ5HcDBKsL1vYiamnRcMxrsjDJboyFEXl0Sk37pZq",
      message:`your OTP verification code is ${randomOTP}`,
      numbers:[mobile]
  }
  //send this message
  fast2sms.sendMessage(options)
  .then((response)=>{
      console.log("otp sent successfully")
  }).catch((error)=>{
      console.log(error)
  })
  return randomOTP;
}

exports.loadOtp = async(req,res)=>{
  const userData = await Users.findById({_id:newUser})
  const otp = sendMessage(userData.phonenumber,res)
  newOtp = otp
  console.log('otp:',otp);
  res.render('otpVerify',{otp:otp,user:newUser})
}
exports.verifyOtp = async(req,res)=>{
  try{
      const otp = newOtp
      const userData = await Users.findById({_id:req.body.user})
      if(otp == req.body.otp){
          userData.isVerified = 1
          const user = await userData.save()
          if(user){
              res.redirect('/login')
          }
      }else{
          res.render('../otpVerify',{message:"Invalid OTP"})
       }
  
      } catch(error){
          console.log(error.message)
       }
      }
exports.loadhome = async(req, res) => {
  try {
    
    const banner = await Banners.find({isActive:1})
    const products = await Products.find({status:1}).limit(4)
    if (req.session.userid) {
      const user = await Users.findById({_id:req.session.userid})
    return  res.render('user/home', {
        banners: banner,
        products,
        user
     })
    } else {
      res.render('user/home', {
        banners: banner,
        products
     })
    }
    
   
  } catch (error) {
    console.log(error.message)
  }
  
}
const itemsPerPage = 3
exports.allProduct = async(req,res)=>{
  try {
    const page = +req.query.page || 1
    const total = await Products.find({isActive:1}).countDocuments()
    const products = await Products.find({isActive:1})
    .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
    res.render('user/shop',{products,
      totalProducts: total,
      needNextPage: itemsPerPage * page < total,
      needPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      itemsPerPage})
  } catch (error) {
    console.log(error.message);
  }
}

exports.womenProduct = async(req,res)=>{
  try {
    const products = await Products.find({isActive:1,category:'women'})
    res.render('user/women',{products})
  } catch (error) {
    console.log(error.message);
  }
}


exports.kidsProduct = async(req,res)=>{
  try {
    const products = await Products.find({isActive:1,category:'kids'})
    res.render('user/kids',{products})
  } catch (error) {
    console.log(error.message);
  }
}

exports.loadsingleproduct=async(req,res)=>{
  try {
    const id=req.query.id
    const userid = req.session.userid
    const product = await Products.findById({_id:id}) 
    res.render('user/singleproduct',{product,userid})
  } catch (error) {
    console.log(error.message);
  }
}
exports.getProducts = async (req, res) => {
  try {
      let products = req.body.products.trim();
      let search = await Products.find({ name: { $regex: new RegExp("^" + products + ".*", "i") } }).exec();
     
      search = search.slice(0, 4);
      res.send({ products: search });
  } catch (error) {
      console.log(error.message);
  }
};

exports.loadloginpage = async(req, res) => {
  try {
    if(req.session.userid){
      const userData = await Users.findById({_id:req.session.userid})
      const myOrders = await Orders.find({userId:req.session.userid})
      
     

      res.render('user/userdetails',{userData,myOrders})
      
    }else{
      res.render('user/userlogin')
    }
   
  } catch (error) {
    console.log(error.message);
  }
 
}
exports.loadmyOrders = async(req,res)=>{
  try {
    const userData = await Users.findById({_id:req.session.userid})
    const myOrders = await Orders.find({userId:req.session.userid})

    if(myOrders.length >0){
      
     
      return res.render('user/myorders',{userData,myOrders})
     }  res.render('user/myorders',{userData,myOrders})
    
   
  } catch (error) {
    console.log(error.message);
  }
}
exports.orderDetails = async(req,res)=>{
  try {
       const order = await Orders.findById({_id:req.query.id}).populate('products.item.productId')
       
       res.render('user/singleOrder',{order})
  } catch (error) {
    console.log(error.message);
  }
}
exports.cancelOrders=async(req,res)=>{
  try {
    
      await Orders.findByIdAndUpdate({_id:req.query.id},{$set:{status:"Canceled"}})
  
   res.redirect('/myorders')
  } catch (error) {
    console.log(error.message);
  }
}
exports.loadregisterpage = (req, res) => {
  res.render('user/register')
}

exports.insertuser = async (req, res) => {
  if (req.body.password === req.body.password2) {
    try {
      const email = req.body.email
      const phonenumber = req.body.phonenumber
      const Data = await Users.findOne({ email })
      if (Data) {
        return res.render('user/register', {
          message: ' User Already Exist'
        })
      }
      const user = new Users({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phonenumber,
        email,
        password: req.body.password
      })

      const userData = await user.save()
      newUser = userData._id

      if (userData) {
        res.redirect("/verifyOtp")
      } else {
        return res.render('user/register.ejs', {
          message: 'Your registration has been failed'
        })
      }
    } catch (error) {
      console.log(error.message)
    }
  } else {
    return res.render('user/register', {
      message: ' Password must be same'
    })
  }
}
exports.userDetails = async(req,res)=>{
  try {
    const { email,phonenumber,country,address,city,state,zip} = req.body

  
    await Users.findByIdAndUpdate({_id:req.session.userid},{$set:{email,phonenumber,country,address,city,state,zip}})

 
      res.redirect('/login')
  } catch (error) {
    console.log(error.message);
  }
}
exports.postLoggin = async (req, res) => {
  try {
    const email = req.body.email
    const password = req.body.password
    const userData = await Users.findOne({ email, isBlocked: false  })

    if (userData.password === password) {
      req.session.userid = userData._id
      return res.redirect('/')
    } else {
      console.log(userData)
      return res.render('user/login', {
        message: 'Email or password is incorrect'
      })
    }
  } catch (error) {
    console.log(error.message)
  }
}

//  cart


exports. loadCart = async(req,res)=>{
  try {
   
      if(req.session.userid ){
          const userData =await Users.findById({ _id:req.session.userid })
         
          
          const populatedData = await userData.populate('cart.item.productId')
         
       
          res.render('user/cart',{cartProduct:populatedData.cart})
         
      }else{
          res.render('user/login')  
      }
          } catch (error) {
      console.log(error);
  }
}
  
     


exports. addToCart = async(req,res)=>{
  const productId = req.query.id
  const quantity = {a: parseInt(req.body.qty)}
  

  userSession = req.session
  const userData =await Users.findById({_id:userSession.userid})
  const productData =await Products.findById({ _id:productId })
  const add = await userData.addToCart(productData,quantity)
  if(add){
    
    userData.removeFromWishlist(productId)
    // res.redirect('/cart')
    res.json({added:'added'})
    
  }

 
}


exports.deleteCart = async(req,res)=>{
try {
  const productId = req.query.id

  const userData = await Users.findById({_id:req.session.userid})
  userData.removefromCart(productId)
  setTimeout(() => {
    res.redirect('/cart')
  }, 1000);
} catch (error) {
  console.log(error.message);
}
 
}

// cart end ...........


// wishlist
exports.loadWishlist = async(req,res)=>{
try {
  if (req.session.userid) {
    const userData =await Users.findById({ _id:req.session.userid })
    const populatedData = await userData.populate('wishlist.item.productId')
    res.render('user/wishlist',{wishlist:populatedData.wishlist})
  } else {
    res.redirect('user/login')
  }
} catch (error) {
  console.log(error.message);
}
}
exports.addToWishlist= async(req,res)=>{
  try {
    const userData = await Users.findById({_id:req.session.userid})
   
    const add = await userData.addToWishlist(req.query.id)
    if (add) {
      userData.removefromCart(req.query.id) 
      res.redirect('/')
    }
    
  } catch (error) {
    console.log(error.message);
  }
}

exports.deleteWishlist = async(req,res)=>{
  try {
    const userData = await Users.findById({_id:req.session.userid})
    userData.removeFromWishlist(req.query.id)
    setTimeout(() => {
      res.redirect('/wishlist')
    }, 1000);
  
  } catch (error) {
    console.log(error.message);
  }
}
      
// checkout''''''''''
let afterPrice = 0
let isApplied = 0
exports.loadcheckout = async(req,res)=>{
  try {
     const date = Date.now()
    
    const userData = await Users.findById({_id:req.session.userid})
   
    const populatedData = await userData.populate('cart.item.productId')
    const coupons = await Coupons.find({date:{$gt:date},status:1,coustomer:{$ne:req.session.userid}})
     console.log(coupons);
 
    res.render('user/checkout',{ cartProduct:populatedData.cart,coupons,afterPrice ,isApplied,user:populatedData, message: req.flash('message')})
  } catch (error) {
    console.log(error.message);
  }
}
exports.couponApply= async(req,res)=>{
  try {
    
  
  
     afterPrice = req.body.value 
     isApplied=1
    
    res.redirect('/checkout')
  } catch (error) {
    console.log(error.message);
  }
}

exports.createOrder = async(req,res)=>{
  try {
    
    const userData = await Users.findById({_id:req.session.userid})
    await Coupons.updateOne({value:req.body.value},{$push:{coustomer:req.session.userid}})
   
    const populatedData = await userData.populate('cart.item.productId')
    
     let order
    if(req.body.currentAddress){
    
      const {_id,country,address,city,state,zip,phonenumber,email}= userData
       order = new Orders({
        userId:_id,
        name:userData.firstname +" " + userData.lastname,
        country,
        address,
        city,state,zip,phone:phonenumber,
        email,
      
    products:populatedData.cart,
    payment:req.body.payment,
    amount:req.body.amount
    
    
         
        
      })
      
    }else {
const {name,country,address,city,state,zip,phone,email,payment ,amount} = req.body
     order = new Orders({
      userId:req.session.userid,
      name,
      country,
    address,
    city,
    state,
    zip,
    phone,
    email,
   
    products:populatedData.cart,
    payment,
    amount
    

      
    })
    
  }
   if(!req.body.payment){
    req.flash('message','Please select on of the payment modes')
    return res.redirect('/checkout')
   }
  const orderData = await order.save()
   
    if (orderData) {
      const productData = await Products.find()
            for(let key of userData.cart.item){
                
                for(let prod of productData){
                    if(new String(prod._id).trim() == new String(key.productId).trim()){                        
                        prod.stock = prod.stock - key.qty
                        await prod.save()
                    }
                }
            } 
      await Users.updateOne({_id:req.session.userid},{cart:{}})
      afterPrice=0
      isApplied=0
   
       if(req.body.payment === "Cash on delivery"){
        res.redirect('/orderSuccess')
       }else if(req.body.payment === 'Razorpay'){
           res.redirect('/razorpay')
       }else if(req.body.payment === 'Paypal'){
        res.render('user/paypal',{total:req.body.amount,userId:req.session.userid})
       }else{
        res.redirect('/checkout')
       }
      
    }else{
      
      res.redirect('/checkout')
    }
  } catch (error) {
    console.log(error.message);
  }
}
exports.orderSuccess = async(req,res)=>{
  try {
   
       res.render('user/orderSuccess')
  } catch (error) {
    console.log(error.message);
  }
}
exports.loadRazorpay = async(req,res)=>{
  try {
  
    res.render('user/razorpay')
  } catch (error) {
    console.log(error.message);
  }
}
// ..................
exports.razorpayCheckout = async(req,res)=>{
  try{
  const userData =await Users.findById({ _id:req.session.userid })
  const completeUser = await userData.populate('cart.item.productId')
  let instance = new Razorpay({ key_id: 'rzp_test_6ECQ3wFYlifQi2', key_secret: 'akkbAG21AjGFcIfvmYditBnf' })

  
  let order = await instance.orders.create({
    amount: 20000000,
    currency: "INR",
    receipt: "receipt#1",
  
  })
  res.status(201).json({
    success:true,
    order,
   
  })
  
  }catch(error){
    console.log(error.message);
  }
               
}

exports.editqty = async(req,res)=>{
  try {
   const id = req.query.id
  
   
   const userData =await Users.findById({_id: req.session.userid})
  
   const foundProduct = userData.cart.item.findIndex(x => x.productId == id)
   
   const qty = {a: parseInt(req.body.qty)}
   userData.cart.item[foundProduct].qty = qty.a
   const price =userData.cart.item[foundProduct].price
   userData.cart.totalPrice = 0

   const totalPrice = userData.cart.item.reduce((acc,curr)=>{
       return acc+(curr.price * curr.qty)
   },0)
   userData.cart.totalPrice = totalPrice
   await userData.save()

   
  
   res.json({totalPrice,price})
  } catch (error) {
   console.log(error.message);
  }
}

exports.userlogout = async(req,res)=>{
  try {
   
    req.session.userid = null
    res.redirect('/')
  } catch (error) {
    console.log(error.message);
  }
}