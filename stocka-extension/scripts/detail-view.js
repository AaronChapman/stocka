// set up event listeners for the detail-view's timeframe option buttons
function setup_detail_listeners() {
	$('.timeframe_option').click(function() {
		// styling
		$('.timeframe_option').removeClass('selected');
		$(this).addClass('selected');
		
		var timeframe = $(this).attr('class').split(' ')[1];
		var ticker = $('.ticker_detail .ticker').text().substring(0, $('.ticker_detail .ticker').text().indexOf(':'));
		
		research(ticker, timeframe);
	});
}

// individual ticker lookup
function research(symbol, timeframe) {
	let local_check = false;
	
	local_chart_data.forEach(function(item) {
		if (item.symbol === symbol) {
			if (has_key(item.data, timeframe)) {
				local_check = true;
			
				if (timeframe === '1m') { set_ticker_details(item.data['1m'], symbol, timeframe, true); }
				else if (timeframe === '6m') { set_ticker_details(item.data['6m'], symbol, timeframe, true); }
				else if (timeframe === '1y') { set_ticker_details(item.data['1y'], symbol, timeframe, true); }
			}
		}
	});
	
	if (!local_check) {
		// fetch ticker data for selected timeframe from iex api
		let url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/chart/' + timeframe;
	  
		// set up ticker detail view with response data	
		fetch(url).then(res => res.json()).then(data => set_ticker_details(data, symbol, timeframe, false));
	}
}

// update ticker detail view
function set_ticker_details(data, ticker, timeframe, from_local) {
	if (from_local) {
		console.log('setting up research view from local copy of symbol data');
	} else {
		if (timeframe === '1m') { local_chart_data.push({'symbol':ticker, 'data':{'1m':data}}); }
		else if (timeframe === '6m') { local_chart_data.push({'symbol':ticker, 'data':{'6m':data}}); }
		else if (timeframe === '1y') { local_chart_data.push({'symbol':ticker, 'data':{'1y':data}}); }
	}
	
	fill_detail_table(data, ticker);
}

function fill_detail_table(information_object, for_symbol) {
	// update ticker being displayed in detail view and empty the data table
	let ticker_to_get = $('.ticker[data-symbol="' + for_symbol + '"]');
	
	$('.ticker_detail .ticker').text(ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price')).attr('class', ticker_to_get.attr('class'));
	//$('.ticker_detail_data').empty();
	
	// object that holds details about the ticker
	let ticker_details = {
		'change':'',
		'highest_price':0.00,
		'lowest_price':0.00,
		'volume_traded':0
	};
	
	// fill up that object with parsed data from iex
	let temp_change = parseFloat(information_object[information_object.length - 1].open - information_object[0].close).toFixed(2);
	
	ticker_details['change'] = temp_change.toString();
	ticker_details['lowest_price'] = parseFloat(information_object[0].low).toFixed(2);
	
	// loop through object to find highest & lowest prices, as well as volume
	information_object.forEach(function(obj) {
		if (obj['high'] > ticker_details['highest_price']) {
			ticker_details['highest_price'] = parseFloat(obj['high']).toFixed(2);
		}
		
		if (obj['low'] < ticker_details['lowest_price']) {
			ticker_details['lowest_price'] = parseFloat(obj['low']).toFixed(2);
		}
		
		ticker_details['volume_traded'] += obj['volume'];
	});
	
	let data_point_index = 0;
		
	// loop through the ticker details object and append table data
	for (var datum in ticker_details) {
    if (ticker_details.hasOwnProperty(datum)) {
	    $('.ticker_detail_data').find('tr').eq(data_point_index).find('td').eq(1).text(number_with_commas(ticker_details[datum]));   
    }
    
    data_point_index++;
	}
	
	additional_research(for_symbol);
	chart_data(information_object);
		
	// aesthetic
	$('.ticker_detail').removeClass('closed').addClass('open');
}

// get addition information about the requested symbol
function additional_research(symbol) {
	let quote_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/quote';
	let news_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/news/last/50';
  
	fetch(quote_request_url).then(res => res.json()).then(data => add_ticker_details(data, symbol));
	fetch(news_request_url).then(res => res.json()).then(data => add_news_to_ticker_detail_view(data));
}

// add market cap info
function add_ticker_details(data, ticker) {
	let additional_ticker_details = {
		'market_cap':data.marketCap
	};
	
	let data_point_index = 4;
		
	for (var datum in additional_ticker_details) {
    if (additional_ticker_details.hasOwnProperty(datum)) { 
			$('.ticker_detail_data').find('tr').eq(data_point_index).find('td').eq(1).text(number_with_commas(additional_ticker_details[datum]));     
    }
    
    data_point_index++;
	}
}

// pull news items for symbol
function add_news_to_ticker_detail_view(news_data) {
	$('.ticker_news').empty();
	
	// determine news container height	
	if (news_data.length === 1) {
		$('.ticker_news').css('height', '50px');
		$('.ticker_detail').css('height', '420px');
	} else if (news_data.length === 0) {
		$('.ticker_news').css('height', '0px');
		$('.ticker_detail').css('height', '370px');
	} else {
		$('.ticker_news').css('height', '100px');
		$('.ticker_detail').css('height', '470px');
	}
	
	// append each formatted item returned from iex
	news_data.forEach(function(news_item) {
		let headline_markup = '<span>' + news_item.datetime.substring(0, news_item.datetime.indexOf('T')) + ':<br></span><a target="_blank" href="' + news_item.url + '">' + news_item.headline + '</a>';
		
			$('.ticker_news').append(headline_markup);
			
			if (news_data.indexOf(news_item) != news_data.length -1) {
				$('.ticker_news').append('<br><br>');
			}
	});
}

// display visually charted data for the symbol over the given timeframe
function chart_data(data) {
	// get a reference to the html5 canvas
	let chart_container = $('#change_chart');
	// create storage for the chart's values and styles
	let chart_values = [];
	let bar_colors = [];
	// grab ascending or descending day styling from hidden elements on the page
	let bar_color_up = $('.theme_to_chart .up').css('background-color');
	let bar_color_down = $('.theme_to_chart .down').css('background-color');
	// temporary value to determine directional gain
	let temp_last_close = 0;
	
	// for each value being charted
	data.forEach(function(item) {
		// push the closing price to the array of values
		chart_values.push(item.close);
		
		// determine the day's bar color
		if (temp_last_close < parseFloat(item.close)) {
			bar_colors.push(bar_color_up);
		} else {
			bar_colors.push(bar_color_down);
		}
		
		// update comparator
		temp_last_close = parseFloat(item.close);
	});
	
	// create chart in the canvas with the appropriate attribute values
	var change_chart = new Chart(chart_container, {
    type: 'bar',
    data: {
	    labels: chart_values,
      datasets: [{
        label: 'share price',
        data: chart_values,
        backgroundColor: bar_colors,
        borderColor: 'white',
        borderWidth: 0
      }]
    },
    options: {
      scales: {
        yAxes: [{ ticks: { beginAtZero:false } }],
        xAxes: [{ display:false  }]
      },
			events: ['click'],
			legend: { display:false}
    }
  });
}

function has_key(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}