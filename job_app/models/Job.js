const mongoose = require('mongoose')

const JobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expireDate: {
        type: Date,
        default: Date.now
    },
    interviewDate: {
        type: Date,
        default: Date.now
    },
    usersApplied: {
        type: Array,
        default: []
    }
})

const Job = mongoose.model('Job', JobSchema)

module.exports = Job