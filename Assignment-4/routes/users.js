const express = require("express")

const homeData = require("./home")

const routes = express.Router()

routes.get("/users", (req, res, next) => {
  const users = homeData.users
  res.render("users", {
    usersData: users,
    pageTitle: "Users",
    path: "/users",
    hasUsers: users.length > 0,
    activeUsers: true,
  })
})

module.exports = routes
