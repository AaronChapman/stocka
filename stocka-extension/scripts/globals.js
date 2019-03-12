// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT']

let market_open_hour_utc = 14;
let market_open_minute_utc = 30;
let market_close_hour_utc = 21;


// to prevent ip blocking from iex api
// get data when new symbol is added and store it here
// remove data when appropriate & put this in chrome storage as well
let local_chart_data = {};