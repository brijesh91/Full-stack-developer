const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { protect } = require('../middleware/auth')
const User = require('../models/User')
const Job = require('../models/Job')
const router = express.Router()

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        res.json(user)        
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   POST api/auth
// @desc    Auth user & get token- Login
// @access  Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }

    const { email, password } = req.body
    try {
        let user = await User.findOne({ email }).select('+password')
        
        if(!user) {
            return res.status(400).json({ msg: 'Invalid Credentials'})
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch){
            return res.status(400).json({ msg: 'Invalid Password'})
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                appliedJobs: user.appliedJobs
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {
                expiresIn: 360000
            },
            (err, token) => {
                if(err) throw err
                res.json({ token })
            })
    } catch (err) {
        console.error(err.message)
        res.status(500).send(err)
    }
})

module.exports = router