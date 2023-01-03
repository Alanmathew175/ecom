const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const path = require('path')


aws.config.update({
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  accessKeyId:process.env.S3_ACCESS_kEY,
  region: process.env.S3_REGION
});



const s3 = new aws.S3()

exports.upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'bugleniger',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })
})







// ..........local connection................

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (file.fieldname !== 'image') {
//       cb(null, 'public/banners')
//     } else {
//       cb(null, 'public/uploadedimages')
//     }
//   },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

  //   cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  // }

// })

// exports.upload = multer({ storage })
