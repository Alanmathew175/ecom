require('dotenv').config()

const mongodb = require('./config/db')
const express = require('express')
const app = express()
const user = require('./routes/userroutes')
const admin = require('./routes/adminroutes')
const cookieParser =require('cookie-parser')
const paypal = require('paypal-rest-sdk');
const cors = require('cors')
paypal.configure({
  'mode': 'sandbox', 
  'client_id':process.env. CLIENT_ID,
  'client_secret':process.env.PAYPAL_SECRET_KEY
});

const session = require('express-session')
const flash = require('connect-flash')
const nocache = require('nocache')
app.use(cors())
app.use(nocache())
app.use(cookieParser())
app.use(
  session({
   
    saveUninitialized: true,
    resave: true
  })
)

app.use(flash())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static('public'))
app.use('/', user)
app.use('/admin', admin)

app.use((req, res) => {
  res.status(404).render('error')
})

app.listen(3000)
