const axios = require('axios')

const config = require('./config');
const {logger, retry, appendToData, emptyDir} = require('./helpers')

module.exports = {run: () => {
        logger.info('✋ Init the collect rates data')

        emptyDir(config.dataDir)

        logger.info('🔆 Starting to collect rates data')

        const collectWorker = () => {
            new Promise(() => 
                //iterate over each rate item and initiate worker for each pair of currencies
                config.rates.forEach( async (rate) => {
                    logger.info(`fetching data for 💰 ${rate.cryptoCoinName}`)
                    let ratesFromAPI = {}
                    await retry(async () => {
                        const res = await axios.get(config.ratesAPIUrl(rate.cryptoCoinName))
                        ratesFromAPI = res.data.data.rates
                    })
                    rate.currencies.forEach( currency => {
                        logger.info(`update rate for 💰 ${rate.cryptoCoinName} => ${currency}`)
                        const exchangeRate = ratesFromAPI[currency] ?? 'N/A'
                        appendToData(rate.cryptoCoinName, currency, exchangeRate)
                    })
                })
            )
        }

        collectWorker()

        setInterval(collectWorker, config.fetchItervalsInSeconds * 1000);
    }
}