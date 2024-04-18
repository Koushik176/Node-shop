const Product = require("../models/product")

const { validationResult } = require("express-validator")

const mongoose = require("mongoose")

const fileHelper = require("../util/file")

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
    // formsCSS: true,
    // productCSS: true,
    // activeAddProduct: true,
  })
  // res.sendFile(path.join(rootDir, "views", "add-product.html"))
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const image = req.file
  const price = req.body.price
  const description = req.body.description
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    })
  }

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }

  const imageUrl = image.path

  const product = new Product({
    //_id: new mongoose.Types.ObjectId("660d4e44754d16f630096bab"),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  })
  product
    .save() //save method from mongoose itself
    .then((result) => {
      //console.log(result)
      console.log(`Product Created with title ${title}`)
      res.redirect("/admin/products")
    })
    .catch((err) => {
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     imageUrl: imageUrl,
      //     price: price,
      //     description: description,
      //   },
      //   errorMessage: "Database operation failed, Please try again Later.",
      //   validationErrors: errors.array(),
      // })
      //res.redirect("/500")
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })

  // const product = new Product(null, title, imageUrl, description, price)
  // product
  //   .save()
  //   .then(() => {
  //     res.redirect("/")
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect("/")
  }
  const prodId = req.params.productId
  Product.findById(prodId)
    //Product.findByPk(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/")
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        // formsCSS: true,
        // productCSS: true,
        // activeAddProduct: true,
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
  // res.sendFile(path.join(rootDir, "views", "add-product.html"))
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const image = req.file
  const updatedDesc = req.body.description

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/")
      }
      product.title = updatedTitle
      product.price = updatedPrice
      product.description = updatedDesc
      if (image) {
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = image.path
      }
      return product.save().then((result) => {
        console.log("UPDATED PRODUCT!")
        res.redirect("/admin/products")
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select("title price -_id")
    // .populate("userId", "name")
    .then((products) => {
      //console.log(products)
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
  // Product.fetchAll((products) => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products",
  //   })
  // })
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."))
      }
      fileHelper.deleteFile(product.imageUrl)
      return Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(() => {
          console.log("DESTROYED THE PRODUCT")
          res.redirect("/admin/products")
        })
        .catch((err) => {
          const error = new Error(err)
          error.httpStatusCode = 500
          return next(error)
        })
    })
    .catch((err) => next(err))
}
