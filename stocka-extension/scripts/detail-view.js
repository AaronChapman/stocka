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
    let request_url = 'https://cloud.iexapis.com/stable/stock/' + symbol + '/batch?types=quote,news,chart&range=' + timeframe + '&token=pk_e7f9b64921c940fc9130bbb040277c37';
    let second_request_url = 'https://cloud.iexapis.com/stable/stock/' + symbol + '/company?token=pk_e7f9b64921c940fc9130bbb040277c37'
  
	// set up ticker detail view with response data	
	fetch(request_url).then(res => res.json()).then(data => set_ticker_details(data, symbol, timeframe)).catch(function() {
      alert_user('market data not yet available for OTCMKTS');
  });
    
    fetch(second_request_url).then(res => res.json()).then(data => add_company_info(data)).catch(function() {
      console.log('~');
  });
}

// update ticker detail view
function set_ticker_details(data, ticker, timeframe) {
	fill_detail_table(data, ticker);
}

function fill_detail_table(information_object, for_symbol) {
    // update ticker being displayed in detail view and empty the data table
	let ticker_to_get = $('.ticker[data-symbol="' + for_symbol + '"]:last');
	
	$('.ticker_detail .ticker').text(ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price')).attr({'class': ticker_to_get.attr('class'), 'tabindex':'0', 'aria-label':ticker_to_get.attr('data-symbol') + ': $' + ticker_to_get.attr('data-latest-price'), 'data-symbol':for_symbol});
	
	// object that holds details about the ticker
	let ticker_details = {
		'change':'',
		'highest_price':0.00,
		'lowest_price':0.00,
		'volume_traded':0
	};

	// fill up that object with parsed data
	let temp_change_a = information_object.chart[0].close.toFixed(2);
	let temp_change_b = information_object.chart[information_object.chart.length - 1].close.toFixed(2);
	let temp_change_c = 0;
	
		if (temp_change_a > temp_change_b) { temp_change_c = ((temp_change_a - temp_change_b) * -1).toFixed(2); }
		else { temp_change_c = Math.abs((temp_change_b - temp_change_a).toFixed(2)); }
	
	// loop through object to find highest & lowest prices, as well as volume
	information_object.chart.forEach(function(item) {
		if (item.high > parseFloat(ticker_details['highest_price'])) {
			ticker_details['highest_price'] = item.high.toFixed(2);
		}
        
			console.log(item.low);console.log(parseFloat(ticker_details['lowest_price']));
		if (item.low < parseFloat(ticker_details['lowest_price'])) {
			ticker_details['lowest_price'] = item.low.toFixed(2);
		} else {
				ticker_details['lowest_price'] = information_object.chart[0].close.toFixed(2);
		}

		ticker_details['volume_traded'] = parseInt(ticker_details['volume_traded']) + information_object.quote.volume;
	});
		
	ticker_details['change'] = temp_change_c;
	
	let data_point_index = 0;
		
	// loop through the ticker details object and append table data
	for (var datum in ticker_details) {
        if (ticker_details.hasOwnProperty(datum)) {
            $('.ticker_detail_data').find('tr').eq(data_point_index).find('td').eq(1).text(number_with_commas(ticker_details[datum]));   
        }
    
        data_point_index++;
	}
	
	additional_news_articles();
	
	if (upgraded) { chart_data(information_object, settings.market_performance_graph_type); }
		
	// aesthetic
	// run a loading screen thing here
	$('.ticker_detail').removeClass('closed').addClass('open');
	$('.detail_view_options').addClass('open').removeClass('closed');
	
	$('.ticker_detail').find('a, button, input, [role="button"]').attr('tabindex', '0');
	$('.close_detail_view').attr('tabindex', '0');
	
	$('.close_detail_view').focus();
}

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
	
	$(articles).find('item').each(function() {
		let headline_markup = '<span>' + parse_yahoo_date($(this).find('pubDate').text().trim()) + ':<br></span><a target="_blank" href="' + $(this).find('link').text().trim() + '">' + $(this).find('title').text().trim() + '</a>';
		
		$('.ticker_news').append(headline_markup + '<br><br>');
	});
    
    //$('.ticker_news').find('br').last().remove();
}

// make date format prettier
function parse_yahoo_date(full_date) {
	let parsed_date = full_date.substring(full_date.indexOf(',') + 2, full_date.indexOf(':') - 3);
	
	return parsed_date;
}

// add company website link and exchange to the ticker detail view
function add_company_info(company_data) {
	let company_link_markup = '';
	
	if (company_data.website.length > 1) {
		company_link_markup = '<a href="' + company_data.website + '" target="_blank">' + company_data.companyName +'</a><br>' + company_data.exchange;
	} else {
		company_link_markup = company_data.companyName + '<br>' + company_data.exchange;
	}
	
	$('.name_and_exchange').html(company_link_markup);
}