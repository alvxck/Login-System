const express = require('express')
const app = express()
const HTTP_PORT = process.env.PORT || 1337;
const cors = require('cors')
const mongoose = require('mongoose')
const User = require('./models/user')
const jwt = require('jsonwebtoken');

//------------------------------------------------------

app.use(cors())
app.use(express.json())
mongoose.connect('mongodb://localhost:27017/login_system')


// TODO: 
// add encryption
// add password / email specific exceptions


// Initialization
app.listen(HTTP_PORT, () => {
    console.log('Server running on port ' + HTTP_PORT)
})

// Register
app.post('/register', async (req, res) => {
    try {
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        res.json({status: 'ok'})
    } catch (err) {
        res.json({status: 'error', error: 'Account exists already'})
    }
})

// Login
app.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
    })
    
    if (user) {
        const token = jwt.sign(
            {
            name: user.name,
            email: user.email
            }, 
            '123'
        )
        return res.json({status: 'ok', user: token})
    } else {
        return res.json({status: 'error', user: false})
    }
})

// Home
app.get('/quote', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decode = jwt.verify(token, '123')
        const email = decode.email
        const user = await User.findOne({ email: email})

        return res.json({status: 'ok', quote: user.quote})

    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'invalid token' })
    }
})

app.post('/quote', async (req, res) => {
    const token = req.headers['x-access-token']

    try {
        const decode = jwt.verify(token, '123')
        const email = decode.email
        await User.updateOne(
            { email: email}, 
            { $set: {quote: req.body.quote}}
        )

        return res.json({status: 'ok'})

    } catch (error) {
        console.log(error)
        res.json({ status: 'error', error: 'invalid token' })
    }
})
