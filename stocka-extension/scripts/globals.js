// local variables for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

let notes = 'you can save notes here. click inside of the box to start editing';

// default symbol set
let default_tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];

// theme data
let current_theme = 'sepia';
let themes = ['default', 'sepia', 'classic', 'midnight', 'tangerine', 'berry'];
let ticker_up_color = '';
let ticker_down_color = '';

// for checking whether or not the market is open
let market_open_hour_utc = 13;
let market_open_minute_utc = 30;
let market_close_hour_utc = 20;

// chart data
let current_chart_data = [];
let share_price_chart;

// settings
let settings = {'theme':'sepia', 'market_performance_graph_type':'bar', 'sort_type':{'option_type':'symbol', 'option_direction':'ascending'}};

// user type
let upgraded = false;