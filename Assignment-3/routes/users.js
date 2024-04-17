const express = require("express")
const path = require("path")

const rootDir = require("../util/path")

const routes = express.Router()

//admin/users => GET
routes.get("/users", (req, res, next) => {
  res.sendFile(path.join(rootDir, "views", "users.html"))
})

//admin/users => POST
routes.post("/users", (req, res, next) => {
  console.log(req.body)
  res.redirect("/")
})

module.exports = routes
