const fs = require('fs')
const path = require('path')
const fsExtra = require('fs-extra')
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const loggerImpl = (level, message) => console.log(`🦒 [${level}] ${message}`)

const logger = {
    debug: (message) => loggerImpl('debug', message),
    info: (message) => loggerImpl('info', message),
    warn: (message) => loggerImpl('warn', message),
    error: (message) => loggerImpl('❌error', message)
}

/**
* Retry the relevant action X times in case of error
*/
const retry = async (action, numOfTries = 3) => {
    let triesCounter = 1;
    let runSuccessfuly = false
    while(triesCounter <= numOfTries){
        try {
            await action()
            runSuccessfuly = true
            break;
        } catch (err) {
            logger.error(`retry #${triesCounter}: ${err}`)
        }
        triesCounter++
    }

    return runSuccessfuly
}

/**
* Get the relevant data path for pair of currencies
*/
const rateFilePath = (from, to) => path.join('data',`${from}to${to}.csv`)

/**
* return the last X line of the given file
*/
const readFileLastLines = async (path, numOfLines) => {

    if(typeof path !== 'string' || typeof numOfLines !== 'number' || numOfLines < 0) {
        logger.error(`invalid input for readFileLastLines ${path} ${numOfLines}`)
        return
    }

    if(fs.existsSync(path)) {
        try {
            const { stdout, stderr } = await exec(`tail -n ${numOfLines} ${path}`)
            if(stderr !== '') logger.error(`stderr: ${stderr}`)
            return stdout
        } catch (e) {
            logger.error(`error: ${e}`)
            return ''
        }
    } else {
        return ''
    }
}

/**
* update the data file for the pair of currencies with the latest rate info
*/
const appendToData = (from, to, rate) => {
    const log = fs.createWriteStream(rateFilePath(from, to), { flags: 'a' })
    log.write(`${new Date()};${rate}\n`)
    log.end()
}

/**
* Empty the given directory
*/
const emptyDir = (path) => fsExtra.emptyDirSync(path)

/**
* Delete the relevant data file
*/
const deleteDataFile = (from, to) => {
    const path = rateFilePath(from, to)
    if(fs.existsSync(path)) {
        fs.unlink(path, () => {})
    }
}

module.exports = {
    logger: logger,
    retry: retry,
    appendToData: appendToData,
    emptyDir: emptyDir,
    readFileLastLines: readFileLastLines,
    rateFilePath: rateFilePath,
    deleteDataFile: deleteDataFile
}