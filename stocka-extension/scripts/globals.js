// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];

let current_theme = 'default';
let themes = ['default', 'midnight', 'sepia'];

let market_open_hour_utc = 13;
let market_open_minute_utc = 30;
let market_close_hour_utc = 20;

let local_chart_data = {};