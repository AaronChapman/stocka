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
	
		// when the detail view's ticker is clicked, close the view
	$('.ticker_detail .ticker, .close_detail_view').click(function() {
		$('.ticker_detail').removeClass('open').addClass('closed');
		$('.detail_view_options').removeClass('open').addClass('closed');
	
		$('.ticker_detail').find('a, button, input, .ticker').attr('tabindex', '-1');
		$('.close_detail_view').attr('tabindex', '-1');
	
		$('.ticker_list .ticker:first').focus();
		
		$('html').scrollTop(0);
	});
}

// individual ticker lookup
function research(symbol, timeframe) {
	let local_check = false;
	
	/*local_chart_data.forEach(function(item) {
		if (item.symbol === symbol) {
			if (has_key(item.data, timeframe)) {
				local_check = true;
			
				if (timeframe === '1m') { set_ticker_details(item.data['1m'], symbol, timeframe, true); }
				else if (timeframe === '6m') { set_ticker_details(item.data['6m'], symbol, timeframe, true); }
				else if (timeframe === '1y') { set_ticker_details(item.data['1y'], symbol, timeframe, true); }
			}
		}
	});*/
	
	if (!local_check) {
		// fetch ticker data for selected timeframe from iex api
		//let url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/chart/' + timeframe;
		let new_url = 'http://54.224.104.209:7810/chart?ticker=' + symbol;
	  
		// set up ticker detail view with response data	
		fetch(new_url).then(res => res.json()).then(data => set_ticker_details(data, symbol, timeframe, false)).catch(function() {
        alert_user('market data not yet available for OTCMKTS');
    });
		
	}
}

// update ticker detail view
function set_ticker_details(data, ticker, timeframe, from_local) {
	/*if (from_local) {
		console.log('same session: loading local data');
	} else {
		// all of this may be obsolete now
		if (timeframe === '1m') { local_chart_data.push({'symbol':ticker, 'data':{'1m':data[0]}}); }
		else if (timeframe === '6m') { local_chart_data.push({'symbol':ticker, 'data':{'6m':data[0]}}); }
		else if (timeframe === '1y') { local_chart_data.push({'symbol':ticker, 'data':{'1y':data[0]}}); }
	}*/
	
	additional_research(ticker);
	
	fill_detail_table(data, ticker);
}

function fill_detail_table(information_object, for_symbol) {
	// update ticker being displayed in detail view and empty the data table
	let ticker_to_get = $('.ticker[data-symbol="' + for_symbol + '"]:last');
	
	$('.ticker_detail .ticker').text(ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price')).attr({'class': ticker_to_get.attr('class'), 'tabindex':'0', 'aria-label':ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price'), 'data-symbol':for_symbol});
	//$('.ticker_detail_data').empty();
	
	// object that holds details about the ticker
	let ticker_details = {
		'change':'',
		'highest_price':0.00,
		'lowest_price':0.00,
		'volume_traded':0
	};
	
	// fill up that object with parsed data
	let temp_change = parseFloat(information_object[information_object.length - 1].open - information_object[0].last).toFixed(2);
	let temp_low = parseFloat(information_object[0].low).toFixed(2);
	
	ticker_details['change'] = temp_change.toString();
	ticker_details['lowest_price'] = temp_low;
	//ticker_details['lowest_price'] = parseFloat(information_object[0].low).toFixed(2);
	
	// loop through object to find highest & lowest prices, as well as volume
	information_object.forEach(function(obj) {
		if (parseFloat(obj['last']) > ticker_details['highest_price']) {
			ticker_details['highest_price'] = parseFloat(obj['high']).toFixed(2);
		}
		
		if (parseFloat(obj['low']) < ticker_details['lowest_price']) {
			ticker_details['lowest_price'] = parseFloat(obj['low']).toFixed(2);
		}
		
		ticker_details['volume_traded'] += parseInt(obj['volume'].replace(',', ''));
	});
	
	let data_point_index = 0;
		
	// loop through the ticker details object and append table data
	for (var datum in ticker_details) {
    if (ticker_details.hasOwnProperty(datum)) {
	    $('.ticker_detail_data').find('tr').eq(data_point_index).find('td').eq(1).text(number_with_commas(ticker_details[datum]));   
    }
    
    data_point_index++;
	}
	
	additional_news_articles();
	//additional_research(for_symbol);
	
	if (upgraded) { chart_data(information_object, settings.market_performance_graph_type); }
		
	// aesthetic
	// run a loading screen thing here
	$('.ticker_detail').removeClass('closed').addClass('open');
	$('.detail_view_options').addClass('open').removeClass('closed');
	$('.ticker_detail').find('a, button, input, [role="button"]').attr('tabindex', '0');
	$('.close_detail_view').attr('tabindex', '0');
	$('.close_detail_view').focus();
}

// get addition information about the requested symbol
function additional_research(symbol) {
	//let company_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/company';
	//let quote_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/quote';
	//let news_request_url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/news/last/50';
	
	let new_company_request_url = 'http://54.224.104.209:7810/symbol?tickers=' + symbol;
  
  fetch(new_company_request_url).then(res => res.json()).then(data => add_company_info(data));
	//fetch(new_company_request_url).then(res => res.json()).then(data => add_ticker_details(data, symbol));
	//fetch(news_request_url).then(res => res.json()).then(data => add_news_to_ticker_detail_view(data));
}

/*
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
	
	
	
	add_company_info(data);
}
*/


// pull news items for symbol
/*function add_news_to_ticker_detail_view(news_data) {
	$('.ticker_news').empty();
	
	// determine news container height	
	if (news_data.length === 1) {
		$('.ticker_detail').removeClass('new_items_0 new_items_2').addClass('new_items_1');
	} else if (news_data.length === 0) {
		$('.ticker_detail').removeClass('new_items_1 new_items_2').addClass('new_items_0');
	} else {
		$('.ticker_detail').removeClass('new_items_0 new_items_1').addClass('new_items_2');
	}
	
	// append each formatted item returned from iex
	news_data.forEach(function(news_item) {
		let headline_markup = '<span>' + news_item.datetime.substring(0, news_item.datetime.indexOf('T')) + ':<br></span><a target="_blank" href="' + news_item.url + '">' + news_item.headline + '</a>';
		
			$('.ticker_news').append(headline_markup);
			
			if (news_data.indexOf(news_item) != news_data.length -1) {
				$('.ticker_news').append('<br><br>');
			}
	});
	
	if (upgraded) { additional_news_articles(); }
}*/

// for investors users, add more articles to news section
function additional_news_articles() {
	let the_url = 'https://cors-anywhere.herokuapp.com/http://finance.yahoo.com/rss/headline?s=' + $('.ticker_detail .ticker').attr('data-symbol');
	
	$.ajax({url: the_url, success: function(result) {
		add_additional_news_articles(result);
  }});
}

// append each item returned from yahoo finance rss feed
function add_additional_news_articles(articles) {
	$('.ticker_news').empty();
	
	var number_of_news_items = $(articles).find('item');
	
	// determine news container height	
	if (number_of_news_items === 1) {
		$('.ticker_detail').removeClass('new_items_0 new_items_2').addClass('new_items_1');
	} else if (number_of_news_items === 0) {
		$('.ticker_detail').removeClass('new_items_1 new_items_2').addClass('new_items_0');
	} else {
		$('.ticker_detail').removeClass('new_items_0 new_items_1').addClass('new_items_2');
	}
	
	$(articles).find('item').each(function() {
		let headline_markup = '<span>' + parse_yahoo_date($(this).find('pubDate').text().trim()) + ':<br></span><a target="_blank" href="' + $(this).find('link').text().trim() + '">' + $(this).find('title').text().trim() + '</a>';
		
		$('.ticker_news').append(headline_markup);
			
		if ($(this).not(':last')) {
			$('.ticker_news').append('<br><br>');
		}

	});
}


// make date format prettier
function parse_yahoo_date(full_date) {
	let parsed_date = full_date.substring(full_date.indexOf(',') + 2, full_date.indexOf(':') - 3);
	
	return parsed_date;
}

// add company website link and exchange to the ticker detail view
function add_company_info(company_data) {
	let company_link_markup = '';
	
	if (company_data[0].website.length > 1) {
		company_link_markup = '<a href="' + company_data[0].website + '" target="_blank">' + company_data[0].name +'</a><br>' + company_data[0].market;
	} else {
		company_link_markup = company_data[0].name + '<br>' + company_data[0].market;
	}
	
	$('.name_and_exchange').html(company_link_markup);
}

// determine if an object has a given key
function has_key(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}