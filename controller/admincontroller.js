const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Users = require("../models/userModel");
const Banner = require("../models/bannerModel");
const Coupon = require("../models/couponModel");
const Admin = require("../models/adminModel");
const Orders = require("../models/orderModel");

const ejs = require("ejs")
const pdf = require("html-pdf")
const fs = require("fs")
const path= require("path")

const itemsPerPage = 5;

exports.loadAdminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect("/admin/home");
        } else {
            res.render("admin/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.verifylogin = async (req, res) => {
    try {
        const adminData = await Admin.findOne({ email: req.body.email });
        if (adminData) {
            if (adminData.password === req.body.password) {
                req.session.admin = adminData._id;

                res.redirect("/admin/home");
            }
        } else {
            res.render("admin/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.loadAdminHome = async (req, res) => {
    try {
        const xxx = await Orders.aggregate([
            {
                $group: {
                    _id: { $dayOfWeek: { date: "$createdAt" } },
                    amount: { $sum: "$amount" },
                },
            },
        ]);
        const count = await Orders.find().count()
        const products = await Products.count()
        const users = await Users.count()
  
        // const a = xxx.map((x) => x._id);
        const amount = xxx.map((x) => x.amount);
    
        res.render("admin/home", {
            path: "/admin/home",
            amount,
            count,
            products,
            users
        });
    } catch (error) {
        console.log(error.message);
    }
};
// HTML to PDF --------
exports.exportInvoice = async(req,res)=>{
    try {
        
        const orders = await Orders.find();
       
        const count = await Orders.find().count()
        
        
        const data ={orders,count}
        const filePathName= path.resolve(__dirname,'../views/admin/htmltopdf.ejs');
        const htmlString = fs.readFileSync(filePathName).toString();

        let options = {Format:'Letter'}
        
        const ejsData = ejs.render(htmlString,data);
        pdf.create(ejsData,options).toFile('salesReport.pdf',(err,response)=>{
            if(err) console.log(err);

            const filePath= path.resolve(__dirname,'../SalesReport.pdf');

            fs.readFile(filePath,(err,file)=>{
                if(err){
                    console.log(err);
                    return res.status(500).send('Could not download File')
                }
                res.setHeader('Content-Type','application/pdf');
                res.setHeader('Content-Disposition','attachment;filename="Invoice.pdf"');
                res.send(file);
            }) 
        })
    } catch (error) {
        console.log(error);
    }
}
exports.loadAdminUsers = async (req, res) => {
    try {
        let search = "";

        if (req.query.search) {
            search = req.query.search;
        }
        console.log(search);
        const page = +req.query.page || 1;
        const total = await Users.find().countDocuments();

        const userDAta = await Users.find()
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);
        res.render("admin/users", {
            users: userDAta,
            path: "/admin/users",
            totalProducts: total,
            needNextPage: itemsPerPage * page < total,
            needPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            currentPage: page,
            itemsPerPage,
        });
    } catch (error) {
        console.log(error.message);
    }
};
exports.blockUser = async (req, res) => {
    try {
        const id = req.query.id;
        const page = +req.query.page || 1;

        const userData = await Users.findById({ _id: id });
        if (userData.isBlocked) {
            await Users.findByIdAndUpdate(
                { _id: id },
                { $set: { isBlocked: false } }
            );
        } else {
            await Users.findByIdAndUpdate(
                { _id: id },
                { $set: { isBlocked: true } }
            );
            req.session.userid
        }
        res.redirect("/admin/users/?page=" + page);
    } catch (error) {
        console.log(error.message);
    }
};

exports.loadAdminProducts = async (req, res) => {
    try {
        const products = await Products.find({ status: 1 });

        res.render("admin/products", {
            path: "/admin/products",
            message: "admin",
            products,
        });
    } catch (error) {
        console.log(error.mess);
    }
};

exports.loadAddProducts = async (req, res) => {
    try {
        const category = await Category.find();
        res.render("admin/add-products", {
            path: "/admin/products",
            category,
            message: req.flash("errormessage"),
        });
    } catch (error) {
        console.log(error.message);
    }
};
exports.insertProducts = async (req, res) => {
    try {
        const a = req.files;

        if (req.files.location) {
            const products = new Products({
                title: req.body.title,
                price: req.body.price,
                description: req.body.description,
                category: req.body.category,
                stock: req.body.stock,
                offer: req.body.offer,
                status: 1,
                brand: req.body.brand,

                image: a.map((x) => x.location),
            });

            const newProduct = await products.save();

            if (newProduct) {
                res.redirect("/admin/add-products");
            } else {
                return res.render("add-product.ejs", {
                    message: "something went wrong",
                });
            }
        } else {
            req.flash("errormessage", " Image field cannot be empty");

            return res.redirect("/admin/add-products");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.editProducts = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await Category.find();

        const editProduct = await Products.findById({ _id: id });

        res.render("admin/edit-products", {
            product: editProduct,
            category,
            path: "/admin/products",
        });
    } catch (error) {
        console.log(error.message);
    }
};

exports.updateProducts = async (req, res) => {
    try {
        const title = req.body.title;
        const category = req.body.category;
        const price = req.body.price;
        const description = req.body.description;
        const stock = req.body.stock;
        const offer = req.body.offer;

        const brand = req.body.brand;

        if (req.files.length) {
            console.log("with pic");
            const a = req.files;
            const image = a.map((x) => x.location);

            await Products.updateOne(
                { _id: req.body.id },
                {
                    $set: {
                        title,
                        image,
                        category,
                        description,
                        stock,
                        price,
                        offer,

                        brand,
                    },
                }
            );
        } else {
            console.log("without pics");
            await Products.updateOne(
                { _id: req.body.id },
                {
                    $set: {
                        title,
                        category,
                        description,
                        stock,
                        price,
                        offer,

                        brand,
                    },
                }
            );
        }
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

exports.deleteProducts = async (req, res) => {
    try {
        await Products.findByIdAndUpdate(
            { _id: req.query.id },
            { $set: { status: 0 } }
        );
        res.redirect("/admin/products");
    } catch (error) {
        console.log(error.message);
    }
};

exports.loadAdminCoupons = async (req, res) => {
    try {
        const date = Date.now();

        await Coupon.updateMany(
            { date: { $lte: date } },
            { $set: { status: 0 } }
        );

        const coupons = await Coupon.find();
        console.log(coupons);
        res.render("admin/coupons", {
            path: "/admin/coupons",
            coupons,
        });
    } catch (error) {
        console.log(error.message);
    }
};
exports.loadAddCoupons = async (req, res) => {
    try {
        res.render("admin/add-coupons", { path: "/admin/coupons" });
    } catch (error) {
        console.log(error.message);
    }
};
exports.insertCoupons = async (req, res) => {
    try {
        const newCoupon = new Coupon({
            code: req.body.code,
            value: req.body.value,
            minbill: req.body.minbill,
            date: req.body.date,
            name: req.body.name,
        });
        const couponData = await newCoupon.save();
        if (couponData) {
            res.redirect("/admin/coupons");
        }
    } catch (error) {
        console.log(error.message);
    }
};

exports.activateCoupons = async (req, res) => {
    try {
        const id = req.query.id;
        const couponData = await Coupon.findOne({ _id: id });

        if (couponData.status == 1) {
            await Coupon.findByIdAndUpdate(
                { _id: id },
                { $set: { status: 0 } }
            );

            return res.redirect("/admin/coupons");
        } else {
            await Coupon.findByIdAndUpdate(
                { _id: id },
                { $set: { status: 1 } }
            );
            return res.redirect("/admin/coupons");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.loadAdminCategory = async (req, res) => {
    try {
        const category = await Category.find();
        res.render("admin/category", {
            path: "/admin/category",
            categories: category,
            message: req.flash("message"),
        });
    } catch (error) {
        console.log(error.message);
    }
};

exports.insertCategory = async (req, res) => {
    try {
        const newCategory = req.body.category;

        const alreadyExist = await Category.findOne({
            categoryName: {
                $regex: new RegExp("^" + newCategory.toLowerCase(), "i"),
            },
        });

        if (alreadyExist) {
            req.flash("message", "Category already exist");

            return res.redirect("/admin/category");
        } else {
            const category = new Category({
                categoryName: newCategory,
            });

            const categoryData = await category.save();

            if (categoryData) {
                res.redirect("/admin/category");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.deleteCategory = async (req, res) => {
    try {
        const name = req.query.name;
        const product = await Products.findOne({ category: name });
        if (product) {
            req.flash(
                "message",
                "Products exist in this category.Please change the product from the category first"
            );

            return res.redirect("/admin/category");
        } else {
            await Category.deleteOne({ _id: id });
            res.redirect("/admin/category");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.loadAdminOrders = async (req, res) => {
    try {
        const a = Date.now();
        
        const orders = await Orders.find();
        res.render("admin/orders", { path: "/admin/orders", orders });
    } catch (error) {
        console.log(error.message);
    }
};
exports.postAdminOrders = async (req, res) => {
    try {
        await Orders.findByIdAndUpdate(
            { _id: req.body.orderid },
            { $set: { status: req.body.status } }
        );
        res.redirect("/admin/orders");
    } catch (error) {
        console.log(error.message);
    }
};
exports.loadAdminBanners = async (req, res) => {
    try {
        const banner = await Banner.find();
        console.log(banner);
        res.render("admin/banners", {
            path: "/admin/banners",
            banners: banner,
        });
    } catch (error) {
        console.log(error.message);
    }
};
exports.addBanner = async (req, res) => {
    try {
        const newBanner = req.body.bannername;
        const a = req.files;

        const banner = new Banner({
            banner: newBanner,
            banerimage: a.map((x) => x.location),
        });

        const bannerData = await banner.save();

        if (bannerData) {
            res.redirect("/admin/banners");
        }
    } catch (error) {
        console.log(error.message);
    }
};
exports.currentBanner = async (req, res) => {
    try {
        const id = req.query.id;
        await Banner.findOneAndUpdate(
            { isActive: 1 },
            { $set: { isActive: 0 } }
        );

        await Banner.findByIdAndUpdate({ _id: id }, { $set: { isActive: 1 } });
        res.redirect("/admin/banners");
    } catch (error) {
        console.log(error.message);
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.admin = null;
        return res.redirect("/admin");
    } catch (error) {
        console.log(error.message);
    }
};
