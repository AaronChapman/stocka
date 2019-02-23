// for holding ticker information
let tickers = [];
let prices = [];
let percentages = [];
let $bpa = $;

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
			markup += '<span class="ticker" data-change-percent="' + change_percent + '" data-latest-price="' + latest_price + '">' + ticker + ': $' + latest_price + '</span>';
			markup += '</div>';
			
			// push the information to the ticker list data arrays
			prices.push({'ticker':ticker, 'price':parseFloat(latest_price).toFixed(2)});
			percentages.push({'ticker':ticker, 'percentage':parseFloat(change_percent).toFixed(2)});
					
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
	
	// when a ticker is moused over show the percentage change
	$('.ticker').mouseover(function() {
		let symbol_info = $(this).text().trim();
		let symbol = symbol_info.substring(0, symbol_info.indexOf(':'));
		
		$(this).text(symbol + ': ' + $(this).attr('data-change-percent') + '%');
	});
	
	// when the ticker is moused out of, reset the ticker display
	$('.ticker').mouseout(function() {
		let symbol_info = $(this).text().trim();
		let symbol = symbol_info.substring(0, symbol_info.indexOf(':'));
		
		$(this).text(symbol + ': $' + $(this).attr('data-latest-price'));
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
		let temporary_tickers = tickers.sort();
		
		// first alphabetically
		if ($(this).hasClass('descending') || $(this).hasClass('unsorted')) {
			$(this).addClass('ascending').removeClass('descending unsorted');
			$(this).text('symbol ⇡');
		} else if ($(this).hasClass('ascending')) {
			// and if requested, reversed
			$(this).addClass('descending').removeClass('ascending');
			$(this).text('symbol ⇣');
			
			temporary_tickers.reverse();
		}
		
		// update local array and ticker list container
		tickers = temporary_tickers;
		
		stock_up();
	});
	
	// sort ticker list by price
	$('.sorting_option_price').click(function() {
		let temporary_tickers = [];
		
		// sort array of ticker prices
		prices.sort(function(a, b) {
			return a.price - b.price;
		});
		
		// temporarily store the sorted array of prices
		prices.forEach(function(item) {
			temporary_tickers.push(item.ticker);
		});
		
		// first return ascending price
		if ($(this).hasClass('descending') || $(this).hasClass('unsorted')) {
			$(this).addClass('ascending').removeClass('descending unsorted');
			$(this).text('price ⇡');
		} else if ($(this).hasClass('ascending')) {
			// and if requested, reversed
			$(this).addClass('descending').removeClass('ascending');
			$(this).text('price ⇣');
			
			temporary_tickers.reverse();
		}
		
		// update local array and ticker list container
		tickers = temporary_tickers;
		
		stock_up();
	});
	
	// sort ticker list by price
	$('.sorting_option_percent').click(function() {
		let temporary_tickers = [];
		
		// sort array of ticker percentage changes
		percentages.sort(function(a, b) {
			return a.percentage - b.percentage;
		});
		
		// temporarily store the sorted array of percentage changes
		percentages.forEach(function(item) {
			temporary_tickers.push(item.ticker);
		});
		
		// first return ascending % changes
		if ($(this).hasClass('descending') || $(this).hasClass('unsorted')) {
			$(this).addClass('ascending').removeClass('descending unsorted');
			$(this).text('percentage ⇡');
		} else if ($(this).hasClass('ascending')) {
			// and if requested, reversed
			$(this).addClass('descending').removeClass('ascending');
			$(this).text('percentage ⇣');
			
			temporary_tickers.reverse();
		}
		
		// update local array and ticker list container
		tickers = temporary_tickers;
		
		stock_up();
	});
}