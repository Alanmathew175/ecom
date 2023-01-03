const express = require('express')
const userroutes = express()


const controller = require('../controller/usercontroller')
const userauth = require('../middleware/userauth')

userroutes.get('/', controller.loadhome)

userroutes.get('/shop', controller.allProduct)

userroutes.get('/men', controller.allProduct)

userroutes.get('/women', controller.womenProduct)

userroutes.get('/kids', controller.kidsProduct)

userroutes.get('/singleview', controller.loadsingleproduct)
userroutes.post("/getProducts", controller.getProducts);


userroutes.get('/cart',userauth.isLoggin, controller.loadCart)
userroutes.post('/addtocart',userauth.isLoggin,controller.addToCart)
userroutes.get('/delete-cart',userauth.isLoggin, controller.deleteCart)

userroutes.get('/wishlist',userauth.isLoggin, controller.loadWishlist)
userroutes.get('/addtowishlist',userauth.isLoggin, controller.addToWishlist)
userroutes.get('/deletewishlist',userauth.isLoggin, controller.deleteWishlist)

userroutes.get('/checkout',userauth.isLoggin, controller.loadcheckout)
userroutes.post('/checkout',userauth.isLoggin, controller.couponApply)
userroutes.post('/place-order',userauth.isLoggin, controller.createOrder)
userroutes.get('/orderSuccess',userauth.isLoggin, controller.orderSuccess)

userroutes.get('/razorpay',userauth.isLoggin,controller.loadRazorpay)
userroutes.post('/razorpay',controller.razorpayCheckout)
userroutes.post('/edit-qty',controller.editqty)


userroutes.get('/login', controller.loadloginpage)

userroutes.get('/myorders',userauth.isLoggin, controller.loadmyOrders)
userroutes.get('/view-details',userauth.isLoggin, controller.orderDetails)


userroutes.get('/cancel-order', controller.cancelOrders)
userroutes.post('/user-details', controller.userDetails)
userroutes.post('/login', controller.postLoggin)

userroutes.get('/verifyOtp', controller.loadOtp)
userroutes.post('/verifyOtp', controller.verifyOtp)

userroutes.get('/register', controller.loadregisterpage)
userroutes.post('/register', controller.insertuser)
userroutes.get('/logout', controller.userlogout)

module.exports = userroutes
