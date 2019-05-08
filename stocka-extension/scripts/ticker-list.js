// set up event listeners related to adding tickers
function setup_ticker_list_listeners() {
	// obvious
	$('.add_tickers').click(function() {
		options_sizing($('.add_tickers_area'));
		
		if ($('.add_tickers').attr('aria-expanded') ==='false') {
			$('.add_tickers').attr('aria-expanded', 'true');
			
			$('.tickers_to_add').focus();
		} else {
			$('.add_tickers').attr('aria-expanded', 'false');
			
			$('.add_tickers').focus();
		}
	});
	
	// when [enter] is pressed on the tickers_to_add input
	$('.tickers_to_add').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			add_tickers();
			
			$('.add_tickers').click();
			$('.add_tickers').focus();
		}
	});
	
	$('.copy_current_symbol_set').hover(function() {
		var symbol_set_to_copy = tickers.join();
		
		$(this).attr('data-clipboard-text', symbol_set_to_copy);
	});
	
	$('.copy_current_symbol_set').on('keydown', function(event) {
		if (event.keyCode === 13 || event.keyCode === 32) {
			$(this)[0].click();
		}
	});
	
	$('.copy_current_symbol_set').click(function() {
		alert_user('copied to clipboard');
	});
	
	new ClipboardJS('.copy_current_symbol_set');
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
	
	// when a symbol is clicked
	$('.ticker_list .ticker').click(function() {
		//alert_user('loading...');
		
		// research the symbol
		research($(this).attr('data-symbol'), '1m');
		
		// change the classes of the options for aesthetic
		$('.timeframe_option').removeClass('selected');
		$('.timeframe_option.1m').addClass('selected');
	});
	
	$('.ticker_list .ticker').on('keydown', function(event) {
		if (event.keyCode === 13 || event.keyCode === 32) {
			$(this).click();
		}
	});
	
	$('.ticker_list .ticker').on('mouseover focus', function() {
		$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-latest-price') + ' ...');
	});
	
	// when the ticker is moused out of, reset the ticker display
	$('.ticker_list .ticker').on('mouseout blur', function() {
		if (!$(this).is(':focus')) {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-latest-price'));
		}
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
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme, 'settings':settings}, function() {
	  check_if_current_set_is_saved();
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
			markup += '<ul class="ticker_elements" role="presentation"><li class="ticker_symbol">';
			markup += '<span class="ticker" ';
			markup += 'data-displayed="price" ';
			markup += 'data-symbol="' + ticker + '" ';
			markup += 'data-latest-price="' + latest_price + '" ';
			markup += 'data-change="' + change + '" ';
			markup += 'data-change-percent="' + change_percent + '" ';
			markup += 'tabindex="0" role="button" aria-label="' + ticker + ': $' + latest_price + ', view more market data">' + ticker + ': ' + latest_price + '</span></li>'
			markup += '<li class="ticker_removal"><button class="remove_ticker" aria-label="remove ' + ticker + ' from this set">✕</button></li></div>';
			
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
	
	setup_theme(current_theme);
		
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