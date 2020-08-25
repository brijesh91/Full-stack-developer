const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    resumeFile: {
        type: Buffer
    },
    appliedJobs: {
        type: Array,
        default: []
    },
    cv: {
        type: Buffer
    }
})

UserSchema.pre('save', async function (next) {
    console.log('I ran')
    // if (!this.isModified('password')) {
    //     next()
    // }

    // // Create a salt, it is a round of iteration for hashing, returns a promise
    // // If password is only modified
    // const salt = await bcrypt.genSalt(10)
    // this.password = await bcrypt.hash(this.password, salt)
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User