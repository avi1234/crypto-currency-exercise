const express = require('express')
const {getRate, getDefaultRate, deleteRate} = require('../controllers/ratesController')

const router = express.Router()

router.get('/:from/:to', getRate) 

router.get('/', getDefaultRate)

router.delete('/:from/:to', deleteRate)

module.exports = router