const express = require("express")

const router = express.Router()

const users = []

router.get("/", (req, res, next) => {
  res.render("home", {
    pageTitle: "Home",
    path: "/",
  })
})

router.post("/", (req, res, next) => {
  //console.log(req.body)
  users.push({ name: req.body.name })
  res.redirect("/users")
})

exports.routes = router
exports.users = users
