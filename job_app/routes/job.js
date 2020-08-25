const express = require('express')
const router = express.Router()
const { protect,authorize } = require('../middleware/auth')
const Job = require('../models/Job')
const User = require('../models/User')

// @route   GET api/job
// @desc    Get all jobs
// @access  Public
router.get('/', async (req,res) => {
    try {
        const job = await Job.find()
        return res.status(200).json({ success: true, data: job})
    } catch (err) {
        res.status(500).json({ msg: 'Server Error'})
    }
})

// @route   GET api/job/:id
// @desc    Get job based on an id
// @access  Public
router.get('/:id', (req, res) => {
    res.status(200).json({ success: true, msg:`Show job ${req.params.id}`})
})

// @route   POST api/job
// @desc    Create new jobs
// @access  Private/Admin
router.post('/', protect,authorize('admin'), async (req, res) => {
    try {
        const job = await Job.create(req.body)
        job.expireDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)    // Job expires in 30 days
        job.interviewDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Interview is scheduled in 5 days
    
        await job.save()
    
        return res.status(201).json({ success: true, data: job})
    } catch (err) {
        res.status(500).json({ msg: 'Server Error'})
    }
})

// @route   PUT api/job
// @desc    Update job based on an id
// @access  Private/Admin
router.put('/:id', protect,authorize('admin'), (req, res) => {
    res.status(200).json({ success: true, msg:`Update job ${req.params.id}`})
}) 

// @route   DELETE api/job/:id
// @desc    Delete job based on an id
// @access  Private/Admin
router.delete('/:id', protect,authorize('admin'), (req, res) => {
    res.status(200).json({ success: true, msg:`Delete job ${req.params.id}`})
})

// @route   PUT api/job/:jobId/apply
// @desc    Apply to a job
// @access  Private
router.put('/:jobId/apply', protect, async (req, res) => {
    let job = await Job.findById(req.params.jobId)

    if(!job) {
        return res.status(400).json({ msg: 'No such Job application'})
    }

    console.log(req.user)

    let user = req.user
    let usersApplied = job.usersApplied
    let appliedJobs = req.user.appliedJobs

    // if (usersApplied.includes(req.user.id) && appliedJobs.includes(req.params.jobId)) {
    //     return res.status(400).json({ msg: `User ${req.user.id} has already applied for Job ${req.params.jobId}`})
    // }

    let found = false
    for(let i = 0; i < usersApplied.length; i++) {
        if (usersApplied[i].id === user.id) {
            found = true;
            return res.status(400).json({ msg: `User ${user.id} has already applied for Job ${req.params.jobId}`})
        }
    }

    usersApplied.push({id: user.id, status: 'applied'})
    appliedJobs.push({id: req.params.jobId, status: 'Applied'})

    console.log(usersApplied)
    console.log(appliedJobs)

    await job.save()
    await user.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        data: job
    })
})

module.exports = router
