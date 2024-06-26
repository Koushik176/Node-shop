const express = require("express")
const path = require("path")

const shopController = require("../controllers/shop")
const isAuth = require("../middleware/is-auth")

const routes = express.Router()

routes.get("/", shopController.getIndex)

routes.get("/products", shopController.getProducts)

routes.get("/products/:productId", shopController.getProduct)

routes.get("/cart", isAuth, shopController.getCart)

routes.post("/cart", isAuth, shopController.postCart)

routes.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct)

routes.get("/checkout", isAuth, shopController.getCheckout)

routes.get('/checkout/success', shopController.getCheckoutSuccess)

routes.get('/checkout/cancel', isAuth, shopController.getCheckout)

routes.get("/orders", isAuth, shopController.getOrders)

routes.get("/orders/:orderId", isAuth, shopController.getInvoice)

module.exports = routes
