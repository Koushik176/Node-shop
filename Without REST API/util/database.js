// const mysql = require("mysql2")

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   database: "node-complete",
//   password: "jaihanuman176"
// })

// module.exports = pool.promise()

// const Sequelize = require("sequelize")

// const sequelize = new Sequelize("node-complete", "root", "jaihanuman176", {
//   dialect: "mysql",
//   host: "localhost",
// })

// module.exports = sequelize

// const mongodb = require("mongodb")
// const MongoClient = mongodb.MongoClient

// let _db

// const mongoConnect = (callback) => {
//   MongoClient.connect(
//     "mongodb+srv://Koushik:wcjyepqQ0UiS5BPj@cluster0.bzrgfmh.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0"
//   )
//     .then((client) => {
//       console.log("CONNECTED!")
//       _db = client.db()
//       callback()
//     })
//     .catch((err) => {
//       console.log(err)
//       throw err
//     })
// }

// const getDb = () => {
//   if (_db) {
//     return _db
//   }
//   throw "No database found!"
// }

// exports.mongoConnect = mongoConnect
// exports.getDb = getDb
