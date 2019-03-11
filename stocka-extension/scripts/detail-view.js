// populate detail with with default data so there's no stretchning
// replace html fields with data instead of emptying

// individual ticker lookup
function research(symbol, timeframe) {
	// fetch ticker data for selected timeframe from iex api
	let url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/chart/' + timeframe;
  
	// set up ticker detail view with response data
	fetch(url).then(res => res.json()).then(data => set_ticker_details(data, symbol));
}

function additional_research(symbol) {
	let quote_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/quote';
	let news_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/news/last/50';
  
	fetch(quote_request_url).then(res => res.json()).then(data => add_ticker_details(data, symbol));
	fetch(news_request_url).then(res => res.json()).then(data => add_news_to_ticker_detail_view(data));
}

function add_ticker_details(data, ticker) {
	let additional_ticker_details = {
		'market_cap':0
	};
	
	additional_ticker_details['market_cap'] = data.marketCap;
	
	for (var datum in additional_ticker_details) {
    if (additional_ticker_details.hasOwnProperty(datum)) { 
			$('.ticker_detail_data').append('<tr><td>' + datum.replace('_', ' ') + '</td><td>' + number_with_commas(additional_ticker_details[datum]) + '</td></tr>');   
    }
	}
}

function add_news_to_ticker_detail_view(news_data) {
	$('.ticker_news').empty();
	
	console.log(news_data);
	
	if (news_data.length === 1) {
		$('.ticker_news').css('height', '50px');
		$('.ticker_detail').css('height', '225px');
	} else if (news_data.length === 0) {
		$('.ticker_news').css('height', '0px');
		$('.ticker_detail').css('height', '175px');
	} else {
		$('.ticker_news').css('height', '100px');
		$('.ticker_detail').css('height', '275px');
	}
	
	news_data.forEach(function(news_item) {
		let headline_markup = '<span>' + news_item.datetime.substring(0, news_item.datetime.indexOf('T')) + ':<br></span><a target="_blank" href="' + news_item.url + '">' + news_item.headline + '</a>';
		
			$('.ticker_news').append(headline_markup);
			
			if (news_data.indexOf(news_item) != news_data.length -1) {
				$('.ticker_news').append('<br><br>');
			}
	});
}

// update ticker detail view
function set_ticker_details(data, ticker) {
	// update ticker being displayed in detail view and empty the data table
	let ticker_to_get = $('.ticker[data-symbol="' + ticker + '"]');
	
	$('.ticker_detail .ticker').text(ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price')).attr('class', ticker_to_get.attr('class'));
	$('.ticker_detail_data').empty();
	
	// object that holds details about the ticker
	let ticker_details = {
		'change':'',
		'highest_price':0.00,
		'lowest_price':0.00,
		'volume_traded':0
	};
	
	// fill up that object with parsed data from iex
	let temp_change = parseFloat(data[data.length - 1].open - data[0].close).toFixed(2);
	
	ticker_details['change'] = temp_change.toString();
	ticker_details['lowest_price'] = parseFloat(data[0].low).toFixed(2);
	
	// loop through object to find highest & lowest prices, as well as volume
	data.forEach(function(obj) {
		if (obj['high'] > ticker_details['highest_price']) {
			ticker_details['highest_price'] = obj['high'];
		}
		
		if (obj['low'] < ticker_details['lowest_price']) {
			ticker_details['lowest_price'] = obj['low'];
		}
		
		ticker_details['volume_traded'] += obj['volume'];
	});
		
	// loop through the ticker details object and append table data
	for (var datum in ticker_details) {
    if (ticker_details.hasOwnProperty(datum)) { 
			$('.ticker_detail_data').append('<tr><td>' + datum.replace('_', ' ') + '</td><td>' + number_with_commas(ticker_details[datum]) + '</td></tr>');   
    }
	}
	
	additional_research(ticker);
		
	// aesthetic
	$('.ticker_detail').removeClass('closed').addClass('open');
}

function setup_detail_listeners() {
	$('.timeframe_option').click(function() {
		var timeframe = $(this).attr('class').split(' ')[1];
		var ticker = $('.ticker_detail .ticker').text().substring(0, $('.ticker_detail .ticker').text().indexOf(':'));
		
		research(ticker, timeframe);
		
		$('.timeframe_option').removeClass('timeframe_selected');
		$(this).addClass('timeframe_selected');
	});
}