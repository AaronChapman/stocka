function setup_ticker_list_listeners() {
	// obvious
	$('.add_tickers').click(function() {
		options_sizing($('.add_tickers_area'));
		
		$('.tickers_to_add').focus();
	});

	$('.tickers_to_add').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			add_tickers();
			
			$('.add_tickers').click();
		}
	});
}

// adding event listeners for content that was appended to the page
function setup_added_listeners() {
	// the ticker removal button
	$('button.remove_ticker').click(function() {
		var ticker_to_remove = $(this).parents('.ticker_container').eq(0);
		
		// this could be simpler but a e s t h e t i c (the cool fade)
		ticker_to_remove.addClass('closed');
		
		setTimeout(function() {
			ticker_to_remove.remove();
		}, 750);
		
		// get the symbol, find the match in the ticker data arrays, and pop those mfs
		let tt_info = $(this).parents('.ticker_elements').eq(0).find('.ticker').text().trim();
		let temp_ticker = tt_info.substring(0, tt_info.indexOf(':'));
		let ticker_index = tickers.indexOf(temp_ticker);
		
		if (ticker_index !== -1) tickers.splice(ticker_index, 1);
				
		remove_ticker_from_array(temp_ticker, 0, prices);
		remove_ticker_from_array(temp_ticker, 0, changes);
		remove_ticker_from_array(temp_ticker, 0, percentages);
		
		// then update chrome storage
		save_tickers();
	});
	
	$('.ticker_list .ticker').click(function() {
		research($(this).attr('data-symbol'), '1m');
		
		$('.timeframe_option').removeClass('timeframe_selected');
		$('.timeframe_option.1m').addClass('timeframe_selected');
	});
	
	$('.ticker_detail .ticker').click(function() {
		$('.ticker_detail').removeClass('open').addClass('closed');
	});
	
	// when a ticker is moused over show the other value change
	$('.ticker_list .ticker').mouseover(function() {
		//$(this).text($(this).attr('data-symbol') + ': Details');
		
		/*if ($('.ticker_list').attr('data-displayed') === "price" || $('.ticker_list').attr('data-displayed') === "change") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		} else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change'));
		}*/
	});
	
	// when the ticker is moused out of, reset the ticker display
	$('.ticker_list .ticker').mouseout(function() {
		set_ticker_display_data();
	});
}

// add new tickers
function add_tickers() {
	let tickers_to_add = $('.tickers_to_add').val().trim();
	
	if (tickers_to_add.length > 0) {
		// validate user input
		validate_ticker_input($('.tickers_to_add').val().trim());
		
		// and update the ticker list
		stock_up();
	}
}

// remove ticker from all related arrays
function remove_ticker_from_array(temp_ticker, ticker_index, array_to_use) {
	array_to_use.forEach(function(item) {
		if (item.ticker === temp_ticker) {
			array_to_use.splice(ticker_index, 1);
		}
	
		ticker_index++;
	});
}

// sync local tickers array to chrome extension storage
function save_tickers() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  //console.log('saving: ', tickers);
	});
}

// validate user's ticker list input
function validate_ticker_input(ticker_input) {
	// temporary tickers
	let temp_tickers = [];
		
	// uppercase user input and remove invalid characters
	ticker_input = ticker_input.toUpperCase().replace(/[^A-Z,+$]/g, '');
		
	// and verify that there is still valid conent to be sent off to the iex api
	if (ticker_input.length > 0) {
		// basically format the new list
		ticker_input = ticker_input.split(',');
		tickers = tickers.concat(ticker_input);
		
		// push valid entries to the temporary tickers array
		tickers.forEach(function(ticker) {
			if (ticker.length > 0 && temp_tickers.indexOf(ticker) == -1) {
				temp_tickers.push(ticker);
			} else {
				console.log('removing duplicate/invalid ticker(s)');
			}
		});
		
		// reassign local data to the array variable (finalized list of valid tickers)
		tickers = temp_tickers;
	}
}

// set up the ticker list
function set_content(data) {
	// first, empty it out
	$('.ticker_list').empty();
	$('.tickers_to_add').val('');
	
	// empty local variables
	prices = [];
	changes = [];
	percentages = [];
	
	// for each item defined in the tickers array
	tickers.forEach(function(ticker) {
		if (data[ticker]) {
			// get & store the data requested from iex
			let latest_price = parseFloat(data[ticker].quote.latestPrice).toFixed(2);
			let change = parseFloat(data[ticker].quote.change).toFixed(2);
			let change_percent = parseFloat(data[ticker].quote.changePercent).toFixed(2);
			// and create a ticker container element with data attributes
			let markup = '<div class="ticker_container">';
			markup += '<ul class="ticker_elements"><li class="ticker_symbol">';
			markup += '<span class="ticker" ';
			markup += 'data-displayed="price" ';
			markup += 'data-symbol="' + ticker + '" ';
			markup += 'data-latest-price="' + latest_price + '" ';
			markup += 'data-change="' + change + '" ';
			markup += 'data-change-percent="' + change_percent + '"';
			markup += '>' + ticker + ': ' + latest_price + '</span></li>'
			markup += '<li class="ticker_removal"><button class="remove_ticker">✕</button></li></div>';
			
			// push the information to the ticker list data arrays
			prices.push({'ticker':ticker, 'array_value':latest_price});
			changes.push({'ticker':ticker, 'array_value':change});
			percentages.push({'ticker':ticker, 'array_value':change_percent});
					
			// and append the new ticker to the document
			$('.ticker_list').append(markup);
						
			// determine styling for the newly added ticker based on day change
			if (change.indexOf('-') != -1) { $('.ticker_list .ticker:last').addClass('down'); }
			else if (change == '0') { $('.ticker_list .ticker:last').addClass('no_change'); }
			else { $('.ticker_list .ticker:last').addClass('up'); }
		} else {
			// if the ticker being added did not receive a valid response from iex
			console.log(ticker, ' is not a valid ticker');
			
			// find the index of the invalid ticker in the newly formed array and snatch that shit outta there
			let index = tickers.indexOf(ticker);
			
			if (index !== -1) tickers.splice(index, 1);
		}
	});
	
	// put forth the ticker data that is to be displayed
	set_ticker_display_data();
	// set up the event listeners for the new added tickers
	setup_added_listeners();
	// and sync the data to chrome storage
	save_tickers();
}

// update which data point is being displayed for each ticker
function set_ticker_display_data() {	
	$('.ticker_list .ticker').each(function() {
		if ($('.ticker_list').attr('data-displayed') === "price") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-latest-price'));
		} else if ($('.ticker_list').attr('data-displayed') === "change") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change'));
		}  else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		} 
	});
		
	// styling
	setTimeout(function() {
		$('.ticker_list').css('opacity', '1');
	}, 250);
}

// get ticker data from the iex api for every symbol in the local tickers array
function stock_up() {
	// currently asking for symbol, price change (day), latest share price, and percentage change (day)
	let url = 'https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=' + tickers.join(',');
  
  // make the api request and start setting up ticker elements in the DOM
  if (tickers.length > 0) {
	  fetch(url).then(res => res.json()).then(data => set_content(data));
	}
}