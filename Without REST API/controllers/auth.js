const crypto = require("crypto")

const User = require("../models/user")
const bcrypt = require("bcryptjs")
const AWS = require("aws-sdk")
const { validationResult } = require("express-validator")
// const { error } = require("console")
// const { param } = require("../routes/auth")
// const path = require("path")

require("dotenv").config()

const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_KEY

AWS.config.update({
  accessKeyId: accessKey,
  secretAccessKey: secretAccessKey,
  region: "ap-south-1", // Change to your preferred AWS region
})

const ses = new AWS.SES({ apiVersion: "2010-12-01" })

exports.getLogin = (req, res, next) => {
  let message = req.flash("error")
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash("error")
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: [],
  })
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    })
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "Invalid email",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        })
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true
            req.session.user = user
            return req.session.save((err) => {
              console.log(err)
              res.redirect("/")
            })
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: "Invalid Password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          })
        })
        .catch((err) => {
          console.log(err)
          res.redirect("/login")
        })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    })
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      })
      return user.save()
    })
    .then((result) => {
      res.redirect("/login")
      const params = {
        Destination: {
          ToAddresses: [email], // Replace with the recipient's email address
        },
        Message: {
          Body: {
            Text: {
              Data: "you successfully signed up! Thank you",
            },
          },
          Subject: {
            Data: "Signup Success!",
          },
        },
        Source: "koushikashok176@gmail.com", // Replace with your verified sender email address
      }

      return ses.sendEmail(params, (err, data) => {
        if (err) {
          console.error("Error sending email:", err)
        } else {
          console.log("Email sent:", data)
        }
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect("/")
  })
}

exports.getReset = (req, res, next) => {
  let message = req.flash("error")
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect("/reset")
    }
    const token = buffer.toString("hex")
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.")
          return res.redirect("/reset")
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
      })
      .then((result) => {
        res.redirect("/")
        const params = {
          Destination: {
            ToAddresses: [req.body.email], // Replace with the recipient's email address
          },
          Message: {
            Body: {
              Html: {
                Data: `
                <p> You requested a password reset </p>
                <p> Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `,
              },
            },
            Subject: {
              Data: "Password Reset",
            },
          },
          Source: "koushikashok176@gmail.com", // Replace with your verified sender email address
        }

        return ses.sendEmail(params, (err, data) => {
          if (err) {
            console.error("Error sending email:", err)
          } else {
            console.log("Email sent:", data)
          }
        })
      })
      .catch((err) => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error")
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then((hashedPasssword) => {
      resetUser.password = hashedPasssword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined
      return resetUser.save()
    })
    .then((result) => {
      res.redirect("/login")
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}
