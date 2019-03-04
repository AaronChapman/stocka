// for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let changes = [];
let percentages = [];

// when the document has finished loading
document.addEventListener("DOMContentLoaded", function(event) {
	// check extension's storage to see if ticker data exists and if so, update local variables with it
	chrome.storage.sync.get(['tickers'], function(result) {
	  if (result.tickers.length > 0) {
		  tickers = result.tickers;
		  
		  stock_up();
		} else {
			tickers = ['AAPL', 'AMZN', 'FB', 'GOOGL', 'MSFT'];
		
			stock_up();	
		}
	});
	
	// set up event listeners for pre-script html elements
	setup_init_listeners();
});

// get ticker data from the iex api for every symbol in the local tickers array
function stock_up() {
	// currently asking for symbol, price change (day), latest share price, and percentage change (day)
	let url = 'https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=' + tickers.join(',') + '&filter=symbol,change,latestPrice,changePercent';
  
  // make the api request and start setting up ticker elements in the DOM
  if (tickers.length > 0) {
	  fetch(url).then(res => res.json()).then(data => set_content(data));
	}
}

function research(symbol) {
	let url = 'https://api.iextrading.com/1.0/stock/' + symbol + '/chart/1m';
  
  if (tickers.length > 0) {
	  fetch(url).then(res => res.json()).then(data => set_ticker_details(data, symbol));
	}
}

function set_ticker_details(data, ticker) {
	let ticker_to_get = $('.ticker[data-symbol="' + ticker + '"]');
	
	$('.ticker_detail .ticker').text(ticker_to_get.text().trim()).attr('class', ticker_to_get.attr('class'));
	$('.ticker_detail_data').empty();
	
	let ticker_details = {
		'change':'',
		'highest_price':0.00,
		'lowest_price':0.00,
		'volume_traded':0
	};
	
	temp_change = parseFloat(data[data.length - 1].high - data[0].close).toFixed(2);
	temp_change = temp_change.toString() + ' (' + parseFloat(data[data.length - 1].changeOverTime).toFixed(2) + ' %)';
	
	ticker_details['change'] = temp_change
	ticker_details['lowest_price'] = parseFloat(data[0].low).toFixed(2);
	
	data.forEach(function(obj) {
		if (obj['high'] > ticker_details['highest_price']) {
			ticker_details['highest_price'] = obj['high'];
		}
		
		if (obj['low'] < ticker_details['lowest_price']) {
			ticker_details['lowest_price'] = obj['low'];
		}
		
		ticker_details['volume_traded'] += obj['volume'];
	});
		
	for (var datum in ticker_details) {
    if (ticker_details.hasOwnProperty(datum)) { 
			$('.ticker_detail_data').append('<tr><td>' + datum.replace('_', ' ').replace('percent', ' (%)') + '</td><td>' + ticker_details[datum] + '</td></tr>');   
    }
	}
	
	$('.ticker_detail').removeClass('closed').addClass('open');
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
			markup += '<span ';
			markup += 'class="ticker" ';
			markup += 'data-displayed="price" ';
			markup += 'data-symbol="' + ticker + '" ';
			markup += 'data-latest-price="' + latest_price + '" ';
			markup += 'data-change="' + change + '" ';
			markup += 'data-change-percent="' + change_percent + '"';
			markup += '>' + ticker + ': ' + latest_price;
			markup += '</span></li>'
			markup += '<li class="ticker_removal"><button class="remove_ticker">✕</button></li>';
			markup += '</div>';
			
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
	setup_event_listeners();
	// and sync the data to chrome storage
	save_tickers();
}

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
		
	setTimeout(function() {
		$('.ticker_list').css('opacity', '1');
	}, 250);
}

// adding event listeners for content that was appended to the page
function setup_event_listeners() {
	// the ticker removal button
	$('button.remove_ticker').click(function() {
		var ticker_to_remove = $(this).parents('.ticker_container').eq(0);
		
		// this could be simpler but a e s t h e t i c (the cool fade)
		ticker_to_remove.addClass('closed');
		
		setTimeout(function() {
			ticker_to_remove.remove();
		}, 750);
		
		// get the symbol, find the match in the tickers array, and pop that mf
		let tt_info = $(this).parents('.ticker_elements').eq(0).find('.ticker').text().trim();
		let temp_ticker = tt_info.substring(0, tt_info.indexOf(':'));
		let ticker_index = tickers.indexOf(temp_ticker);
		
		if (ticker_index !== -1) tickers.splice(ticker_index, 1);
				
		let price_index = 0;
		
		prices.forEach(function(item) {
			if (item.ticker === temp_ticker) {
				prices.splice(price_index, 1);
			}
			
			price_index++;
		});
		
		let change_index = 0;
		
		 changes.forEach(function(item) {
			if (item.ticker === temp_ticker) {
				changes.splice(change_index, 1);
			}
			
			change_index++;
		});
		
		let percentage_index = 0;
		
		percentages.forEach(function(item) {
			if (item.ticker === temp_ticker) {
				percentages.splice(percentage_index, 1);
			}
			
			percentage_index++;
		});
		
		// then update chrome storage
		save_tickers();
	});
	
	$('.ticker_list .ticker').click(function() {
		research($(this).attr('data-symbol'));
	});
	
	$('.ticker_detail .ticker').click(function() {
		$('.ticker_detail').removeClass('open').addClass('closed');
	});
	
	// when a ticker is moused over show the other value change
	$('.ticker_list .ticker').mouseover(function() {
		if ($('.ticker_list').attr('data-displayed') === "price" || $('.ticker_list').attr('data-displayed') === "change") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		} else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change'));
		}
	});
	
	// when the ticker is moused out of, reset the ticker display
	$('.ticker_list .ticker').mouseout(function() {
		set_ticker_display_data();
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
			if (ticker.length > 0) {
				temp_tickers.push(ticker);
			}
		});
		
		// reassign local data to the array variable (finalized list of valid tickers)
		tickers = temp_tickers;
	}
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

// sync local tickers array to chrome extension storage
function save_tickers() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  //console.log('saving: ', tickers);
	});
}

// open (or close) the sorting options area
function sorting_options() {
	if ($('.sorting_options').hasClass('closed')) {
		$('.sorting_options').addClass('open').removeClass('closed');
	} else if ($('.sorting_options').hasClass('open')) {
		$('.sorting_options').addClass('closed').removeClass('open');
	}
}

// set up event listeners for elements that are present in the source document
function setup_init_listeners() {
	// obvious
	$('.add_tickers').click(function() { add_tickers(); });
	
	$('.sorting_options_button').click(function() { sorting_options(); });
	
	// sort ticker list by symbol
	$('.sorting_option_symbol').click(function() {
		$('.ticker_list').css('opacity', '0');
		
		var option_clicked = $(this);
		
		setTimeout(function() {			
			temporary_tickers = tickers.sort();
			
			sort_update_interface(option_clicked);
			
			// update local array and ticker list container
			tickers = temporary_tickers;
			
			stock_up();
		}, 500);
	});
	
	// sort ticker list by price
	$('.sorting_option_price').click(function() {
		$('.ticker_list').css('opacity', '0');
		
		var option_clicked = $(this);
		
		setTimeout(function() {	
			sorting_option_number(prices, option_clicked);
			
			$('.ticker_list').attr('data-displayed', 'price');
			
			$('.ticker_list .ticker').each(function() {
				$(this).text(option_clicked.attr('data-symbol') + ': ' + option_clicked.attr('data-latest-price'));
			});
		}, 500);
	});
	
	
	// sort ticker list by price
	$('.sorting_option_change').click(function() {
		$('.ticker_list').css('opacity', '0');
		
		var option_clicked = $(this);
		
		setTimeout(function() {	
			sorting_option_number(changes, option_clicked);
			
			$('.ticker_list').attr('data-displayed', 'change');
			
			$('.ticker_list .ticker').each(function() {
				$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change'));
			});
		}, 500);
	});
	
	// sort ticker list by price
	$('.sorting_option_percent').click(function() {
		$('.ticker_list').css('opacity', '0');
		
		var option_clicked = $(this);
		
		setTimeout(function() {	
			sorting_option_number(percentages, option_clicked);
			
			$('.ticker_list').attr('data-displayed', 'percent');
			
			$('.ticker_list .ticker').each(function() {
				$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
			});
		}, 500);
	});
}

// update the ticker list based on the sortion option clicked
function sort_update_interface(sorting_option) {
	// first return ascending array and interface updates
	if (sorting_option.hasClass('descending') || sorting_option.hasClass('unsorted')) {
		sorting_option.addClass('ascending').removeClass('descending unsorted');
	} else if (sorting_option.hasClass('ascending')) {
		// and if requested, reversed
		sorting_option.addClass('descending').removeClass('ascending');
		
		temporary_tickers.reverse();
	}
}

// for sorting numeric value arrays
function sorting_option_number(array_to_use, option_clicked) {
	temporary_tickers = [];
		
	// perform sort
	array_to_use.sort(function(a, b) {
		return a.array_value - b.array_value;
	});
	
	// get tickers array in order
	array_to_use.forEach(function(item) {
		temporary_tickers.push(item.ticker);
	});

	sort_update_interface(option_clicked);
			
	tickers = temporary_tickers;
	
	// and stock up
	stock_up();
}