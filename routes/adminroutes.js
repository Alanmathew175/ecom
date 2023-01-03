const express = require('express')
const admin = express()

const adminController = require('../controller/admincontroller')
const multer = require('../util/multer')
const adminauth = require('../middleware/adminauth')

admin.get('/', adminauth.isLogout, adminController.loadAdminLogin)

admin.post('/', adminController.verifylogin)

admin.get('/home', adminauth.isLoggin, adminController.loadAdminHome)

admin.get('/sales-report',  adminController.exportInvoice)

admin.get('/users', adminauth.isLoggin, adminController.loadAdminUsers)

admin.get('/block-user', adminauth.isLoggin, adminController.blockUser)

admin.get('/products', adminauth.isLoggin, adminController.loadAdminProducts)

admin.get('/add-products', adminauth.isLoggin, adminController.loadAddProducts)

admin.post('/add-products', multer.upload.array('image', 4), adminController.insertProducts)

admin.get('/edit-products', adminauth.isLoggin, adminController.editProducts)

admin.post('/edit-products', multer.upload.array('image', 4), adminController.updateProducts)

admin.get('/delete-products', adminauth.isLoggin, adminController.deleteProducts)

admin.get('/coupons', adminauth.isLoggin, adminController.loadAdminCoupons)

admin.get('/add-coupons', adminauth.isLoggin, adminController.loadAddCoupons)

admin.post('/add-coupons', adminController.insertCoupons)

admin.get('/activate-coupons', adminauth.isLoggin, adminController.activateCoupons)

admin.get('/category', adminauth.isLoggin, adminController.loadAdminCategory)

admin.post('/category', adminController.insertCategory)

admin.get('/delete-category', adminauth.isLoggin, adminController.deleteCategory)

admin.get('/orders', adminauth.isLoggin, adminController.loadAdminOrders)

admin.post('/orders', adminController.postAdminOrders)

admin.get('/banners', adminauth.isLoggin, adminController.loadAdminBanners)

admin.post('/banners', multer.upload.array('bannerimage',3), adminController.addBanner)

admin.get('/current-banner', adminauth.isLoggin, adminController.currentBanner)

admin.get('/logout', adminauth.isLoggin, adminController.logout)

module.exports = admin
