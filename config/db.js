
const mongoose = require('mongoose')

const dburl = process.env.DBURL

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
module.exports = mongoose
  .connect(dburl, connectionParams)
  .then()
  .catch((err) => console.log(err))
