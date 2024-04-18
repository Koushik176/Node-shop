const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")

const mongoose = require("mongoose")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)
const csrf = require("csurf")
const flash = require("connect-flash")
const multer = require("multer")
// const expressHbs = require("express-handlebars")

const errorController = require("./controllers/error")
const User = require("./models/user")
//const mongoConnect = require("./util/database").mongoConnect

const MONGODB_URI =
  "mongodb+srv://Koushik:wcjyepqQ0UiS5BPj@cluster0.bzrgfmh.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0"

const app = express()
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
})

const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images")
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/\-/g, "-").replace(/\:/g, "-") +
        "-" +
        file.originalname
    )
  },
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// const sequelize = require("./util/database")
// const Product = require("./models/product")
// const User = require("./models/user")
// const Cart = require("./models/cart")
// const CartItem = require("./models/cart-item")
// const Order = require("./models/order")
// const OrderItem = require("./models/order-item")

// app.engine(
//   "hbs",
//   expressHbs({
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layout",
//     extname: "hbs",
//   })
// )

app.set("view engine", "ejs")
app.set("views", "views")

const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const authRoutes = require("./routes/auth")
// const { render } = require("pug")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
)
app.use(express.static(path.join(__dirname, "public")))
app.use("/images", express.static(path.join(__dirname, "images")))

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
)

app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next()
      }
      req.user = user
      next()
    })
    .catch((err) => {
      next(new Error(err))
    })
})

app.use("/admin", adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.get("/500", errorController.get500)

app.use(errorController.get404)

app.use((error, req, res, next) => {
  console.log(error)
  res.redirect("/500")
  // res.status(500).render("500", {
  //   pageTitle: "Error",
  //   path: "/500",
  //   isAuthenticated: req.session.isLoggedIn,
  // })
})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000)
  })
  .catch((err) => {
    console.log(err)
  })

// mongoConnect(() => {
//   app.listen(3000)
// })

/*The A.hasOne(B) association means that a One-To-One relationship exists between A and B,
with the foreign key being defined in the target model (B).

The A.belongsTo(B) association means that a One-To-One relationship exists between A and B,
with the foreign key being defined in the source model (A).

The A.hasMany(B) association means that a One-To-Many relationship exists between A and B,
with the foreign key being defined in the target model (B).*/

// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" })
// User.hasMany(Product)
// User.hasOne(Cart)
// Cart.belongsTo(User)
// Cart.belongsToMany(Product, { through: CartItem })
// Product.belongsToMany(Cart, { through: CartItem })
// Order.belongsTo(User)
// User.hasMany(Order)
// Order.belongsToMany(Product, { through: OrderItem })

// sequelize
//   //.sync({ force: true })
//   .sync()
//   .then((result) => {
//     return User.findByPk(1)
//     // console.log(result)
//   })
//   .then((user) => {
//     if (!user) {
//       return User.create({ name: "Koushik", email: "test@test.com" })
//     }
//     return user
//   })
//   .then((user) => {
//     //console.log(user)
//     return user.createCart()
//   })
//   .then((cart) => {
//     app.listen(3000)
//   })
//   .catch((err) => {
//     console.log(err)
//   })
