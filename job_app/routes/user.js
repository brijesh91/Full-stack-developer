const express = require('express')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const multer = require('multer')
const { protect } = require('../middleware/auth')
const User = require('../models/User')

const router = express.Router()

// @route   POST api/user
// @desc    Register a user
// @access  Public
router.post('/', [
    check('name', 'Please add a name')
    .not()
    .isEmpty(),
    check('email', 'Please add a valid email')
    .isEmail(),
    check('password', 'Please enter a password with 6 or more chars')
    .isLength({ min: 6 })
],
    async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }

    const { name, email, password } = req.body

    try {
        let user = await User.findOne({ email })
        console.log(user)
        if(user) {
            return res.status(400).json({ msg: 'User already exists' })
        }
        user = new User({
            name,
            email,
            password
        })

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user: {
                id: user.id,
                role: user.role,
                appliedJobs: user.appliedJobs
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err) throw err
            res.json({ token })
        })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(pdf|docx|doc)$/)){
           return cb(new Error('Should be pdf or docx or doc format only'))
        }

        cb(undefined,true)
    }
})

// @route   api/user/cv
// @desc    Upload a cv/resume
// @access  Private
router.post('/cv',protect, upload.single('cv'), async (req,res) => {
    console.log(req.file)
    const buffer = await req.file.buffer.toBuffer()
    req.user.cv = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next) => {
    res.status(400).send({
        error: error.message
    })
})

module.exports = router