module.exports = {
    rates: [{cryptoCoinName: 'BTC', currencies:['USD','EUR']},{cryptoCoinName: 'ETH', currencies:['USD','EUR']}],
    fetchItervalsInSeconds: 60,
    defaultRate: {cryptoCoinName: 'BTC', currency: 'USD'},
    defaultGetRatesTimeframe: 5,
    maxGetRatesTimeframe: 1000,
    ratesAPIUrl: (cryptoCoinName) => `https://api.coinbase.com/v2/exchange-rates?currency=${cryptoCoinName}`,
    dataDir: 'data',
    port: 3001
}