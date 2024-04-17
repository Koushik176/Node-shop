const express = require('express')

const app = express()

// app.use((req, res, next) => {
//     console.log("1st middleware")
//     next()
// })

// app.use((req, res, next) => {
//     console.log("2nd middleware")
//     next()
// })

// app.use((req, res, next) => {
//     console.log("3rd middleware")
//     res.send('<h1>Dummy Page!</h1>')
// })

app.use('/users', (req, res, next) => {
    console.log('users Page middleware')
    res.send('<h1>Users Page</h1>')
})

app.use('/',(req, res, next) => {
    console.log("Home Page Middleware")
    res.send('<h1>Home Page!</h1>')
})

app.listen(3000);