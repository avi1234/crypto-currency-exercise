const express = require('express')
const morgan = require('morgan')

const config = require('./config');
const {logger} = require('./helpers')
const collectRatesData = require('./collectRatesData')

const ratesRouter = require('./routes/ratesRoutes')

collectRatesData.run()

const app = express()

app.use(morgan('tiny'))
app.use('/api/rates', ratesRouter)

app.listen(config.port, () => logger.info(`🆗 server is up on port ${config.port}`))