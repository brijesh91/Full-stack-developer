const express = require('express')
const connectDB = require('./config/db')

// Routes files
const job = require('./routes/job')
const users = require('./routes/user')
const auth = require('./routes/auth')

const app = express()

// Connect Database
connectDB()

// Init Middleware
app.use(express.json({ extended: false}))

// Mount routers
app.use('/api/job', job)
app.use('/api/user', users)
app.use('/api/auth', auth)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

