// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

// default symbol set
let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];

// theme data
let current_theme = 'default';
let themes = ['default', 'midnight', 'sepia'];
let ticker_up_color = '';
let ticker_down_color = '';

// for checking whether or not the market is open
let market_open_hour_utc = 13;
let market_open_minute_utc = 30;
let market_close_hour_utc = 20;

// future endeavors
let local_chart_data = [];