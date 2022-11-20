const config = require('../config');
const helpers = require('../helpers');
const {logger, rateFilePath} = require('../helpers')

/**
* Parse 'from' and 'to' from the req
*/
const parseFromTo = (req, res) => {
    if(typeof req.params.from !== 'string' || typeof req.params.to !== 'string') {
        logger.error('invalid input for action')
        res.status(400).send('invalid input for action')
        return {valid: false}
    }
    return {valid: true, from: req.params.from.toUpperCase(), to: req.params.to.toUpperCase()}
}

/**
* GET action for get specific rate info
*/
const getRate = async (req, res) => {
    
    //validate and parse input
    const parsedFromTo = parseFromTo(req, res)
    if(!parsedFromTo.valid) return

    let parsedTimeframe = parseInt(req.query.timeframe)

    if(isNaN(parsedTimeframe) || parsedTimeframe <=0 || parsedTimeframe > config.maxGetRatesTimeframe) {
        parsedTimeframe = config.defaultGetRatesTimeframe
    }

    const from = parsedFromTo.from  
    const to = parsedFromTo.to
    const timeframe = parsedTimeframe

    //check that specific pairing exists
    const rateFromConfig = config.rates.find(rate => {
        return rate.cryptoCoinName === from && (rate.currencies.findIndex(currency => currency === to) > -1)
    })

    if(typeof rateFromConfig === 'undefined') {
        res.status(404).json({success: false, version:'v1', message: "rates doesn't exist", content:{from: from, to: to}})
        return
    }

    //read the last x lines from the data file based on the selected timeframe
    const fileData = await helpers.readFileLastLines(rateFilePath(from, to), timeframe)

    //create results as json
    const fileDataAsJson = fileData.split('\n').reduce((accumulator, line) => {
        valuesInLine = line.split(';')
        if(valuesInLine.length === 2)
            accumulator.push({date: valuesInLine[0], rate: valuesInLine[1]})
        return accumulator
    }, [])

    res.json({success: true, version:'v1', content: [{from: from, to: to, data: fileDataAsJson}]})
}

/**
* GET action for get specific rate info with default from and to currencies
*/
const getDefaultRate = (req, res) => {
    req.params.from = config.defaultRate.cryptoCoinName
    req.params.to = config.defaultRate.currency
    getRate(req, res)
}

/**
* DELETE action for deleting specific pair of currencies
*/
const deleteRate = (req, res) => {
    //validate and parse input
    const parsedFromTo = parseFromTo(req, res)
    if(!parsedFromTo.valid) return

    const from = parsedFromTo.from
    const to = parsedFromTo.to

    //check tha relevant currenct exists
    const rate = config.rates.find((rate) => rate.cryptoCoinName === from)
    if (typeof rate === 'undefined') return

    //remove the to currency from the config
    const removeIndex = rate.currencies.indexOf(to)

    if(removeIndex > -1) {
        rate.currencies.splice(removeIndex, 1)
    }

    //delete the relevant data file
    helpers.deleteDataFile(from, to)

    res.send({success: true})
}

module.exports = {getRate, getDefaultRate, deleteRate}