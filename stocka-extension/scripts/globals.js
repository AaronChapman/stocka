// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];

let current_theme = 'default';
let themes = 
[{'theme_name':'default', 'ticker_up_hex_color':'#427557', 'ticker_down_hex_color':'#ce8988', 'other_background_color':'snow', 'detail_view_text_color':'black'}, 
{'theme_name':'midnight', 'ticker_up_hex_color':'#101035', 'ticker_down_hex_color':'#461133', 'other_background_color':'#251020', 'detail_view_text_color':'white'}];

let market_open_hour_utc = 13;
let market_open_minute_utc = 30;
let market_close_hour_utc = 20;


// to prevent ip blocking from iex api
// get data when new symbol is added and store it here
// remove data when appropriate & put this in chrome storage as well
let local_chart_data = {};