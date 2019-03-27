// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

let notes = 'you can save notes here\nclick anywhere inside the box to type';

// default symbol set
let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];

// theme data
let current_theme = 'default';
let themes = ['default', 'sepia', 'midnight', 'tangerine'];
let ticker_up_color = '';
let ticker_down_color = '';

// for checking whether or not the market is open
let market_open_hour_utc = 13;
let market_open_minute_utc = 30;
let market_close_hour_utc = 20;

// to help prevent spammy users from getting their ip addresses blocked by iex
// if another research request is made for the same symbol in the same session, the data will be pulled from a local copy
let local_chart_data = [];
let current_chart_data = [];

let upgraded = false;