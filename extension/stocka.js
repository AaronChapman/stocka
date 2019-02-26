// for holding ticker information
let tickers = [];
let temporary_tickers = [];
let prices = [];
let percentages = [];

// when the document has finished loading
document.addEventListener("DOMContentLoaded", function(event) {
	// check extension's storage to see if ticker data exists and if so, update local variables with it
	chrome.storage.sync.get(['tickers'], function(result) {
	  if (result.tickers.length > 0) { tickers = result.tickers; }
	  else { tickers = []; }
	  
	  // get ticker data
	  stock_up();
	});
	
	// set up event listeners for pre-script html elements
	setup_init_listeners();
});

// get ticker data from the iex api for every symbol in the local tickers array
function stock_up() {
	// currently asking for symbol, price change (day), latest share price, and percentage change (day)
	let url = 'https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=' + tickers.join(',') + '&filter=symbol,change,latestPrice,changePercent';
  
  // make the api request and start setting up ticker elements in the DOM
  fetch(url).then(res => res.json()).then(data => set_content(data));
}

// set up the ticker list
function set_content(data) {
	// first, empty it out
	$('.ticker_list').empty();
	$('.tickers_to_add').val('');
	
	// empty local variables
	prices = [];
	percentages = [];
	
	// for each item defined in the tickers array
	tickers.forEach(function(ticker) {
		if (data[ticker]) {
			// get & store the data requested from iex
			let latest_price = parseFloat(data[ticker].quote.latestPrice).toFixed(2);
			let change_percent = parseFloat(data[ticker].quote.changePercent).toFixed(2);
			// and create a ticker container element with data attributes
			let markup = '<div class="ticker_container">';
			markup += '<button class="remove_ticker">✕</button>';
			markup += '<span class="ticker" data-displayed="price" data-symbol="' + ticker + '" data-change-percent="' + change_percent + '" data-latest-price="' + latest_price + '">' + ticker + ': $' + latest_price + '</span>';
			markup += '</div>';
			
			// push the information to the ticker list data arrays
			prices.push({'ticker':ticker, 'array_value':parseFloat(latest_price).toFixed(2)});
			percentages.push({'ticker':ticker, 'array_value':parseFloat(change_percent).toFixed(2)});
					
			// and append the new ticker to the document
			$('.ticker_list').append(markup);
			
			// determine styling for the newly added ticker based on day change
			let change = data[ticker].quote.change.toString();
					
			if (change.indexOf('-') != -1) { $('.ticker:last').addClass('down'); }
			else if (change == '0') { $('.ticker:last').addClass('no_change'); }
			else { $('.ticker:last').addClass('up'); }
		} else {
			// if the ticker being added did not receive a valid response from iex
			console.log(ticker, ' is not a valid ticker');
			
			// find the index of the invalid ticker in the newly formed array and snatch that shit outta there
			let index = tickers.indexOf(ticker);
			
			if (index !== -1) tickers.splice(index, 1);
		}
	});
	
	$('.ticker').each(function() {
		if ($('.ticker_list').attr('data-displayed') === "price") {
			$(this).text($(this).attr('data-symbol') + ': $' + $(this).attr('data-latest-price'));
		} else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		} 
	});
	
	// set up the event listeners for the new added tickers
	setup_event_listeners();
	// and sync the data to chrome storage
	save_tickers();
}

// adding event listeners for content that was appended to the page
function setup_event_listeners() {
	// the ticker removal button
	$('button.remove_ticker').click(function() {
		var ticker_to_remove = $(this).parent();
		
		// this could be simpler but a e s t h e t i c (the cool fade)
		ticker_to_remove.addClass('closed');
		
		setTimeout(function() {
			ticker_to_remove.remove();
		}, 750);
		
		// get the symbol, find the match in the tickers array, and pop that mf
		let tt_info = $(this).next().text().trim();
		let temp_ticker = tt_info.substring(0, tt_info.indexOf(':'));
		let index = tickers.indexOf(temp_ticker);
		
		if (index !== -1) tickers.splice(index, 1);
		
		// then update chrome storage
		save_tickers();
	});
	
	// when a ticker is moused over show the other value change
	$('.ticker').mouseover(function() {
		if ($('.ticker_list').attr('data-displayed') === "price") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		} else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': $' + $(this).attr('data-latest-price'));
		}
	});
	
	// when the ticker is moused out of, reset the ticker display
	$('.ticker').mouseout(function() {
		if ($('.ticker_list').attr('data-displayed') === "price") {
			$(this).text($(this).attr('data-symbol') + ': $' + $(this).attr('data-latest-price'));
		} else if ($('.ticker_list').attr('data-displayed') === "percent") {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		}
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
		temporary_tickers = tickers.sort();
		
		sort_update_interface($(this));
		
		// update local array and ticker list container
		tickers = temporary_tickers;
		
		stock_up();
	});
	
	// sort ticker list by price
	$('.sorting_option_price').click(function() {
		sorting_option_number(prices, $(this));
		
		$('.ticker_list').attr('data-displayed', 'price');
		
		$('.ticker').each(function() {
			$(this).text($(this).attr('data-symbol') + ': $' + $(this).attr('data-latest-price'));
		});
	});
	
	// sort ticker list by price
	$('.sorting_option_percent').click(function() {
		sorting_option_number(percentages, $(this));
		
		$('.ticker_list').attr('data-displayed', 'percent');
		
		$('.ticker').each(function() {
			$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr('data-change-percent') + '%');
		});
	});
}

function sort_update_interface(sorting_option) {
	$('.sorting_options .sorting_option').each(function() {
		if ($(this).text().indexOf('⇡') != -1 || $(this).text().indexOf('⇣') != -1) {
			$(this).text($(this).text().substring(0, $(this).text().length - 1));
		}
	});
	
	// first return ascending array and interface updates
	if (sorting_option.hasClass('descending') || sorting_option.hasClass('unsorted')) {
		sorting_option.addClass('ascending').removeClass('descending unsorted');
		sorting_option.text(sorting_option.text() + ' ⇡');
	} else if (sorting_option.hasClass('ascending')) {
		// and if requested, reversed
		sorting_option.addClass('descending').removeClass('ascending');
		sorting_option.text(sorting_option.text().substring(0, sorting_option.text().length - 1) + ' ⇣');
		
		temporary_tickers.reverse();
	}
}

function sorting_option_number(array_to_use, option_clicked) {
	temporary_tickers = [];
		
	array_to_use.sort(function(a, b) {
		return a.array_value - b.array_value;
	});
	
	array_to_use.forEach(function(item) {
		temporary_tickers.push(item.ticker);
	});

	sort_update_interface(option_clicked);
			
	tickers = temporary_tickers;
	
	stock_up();
}