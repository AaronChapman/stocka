let tickers = [];
let prices = [];
let percentages = [];

document.addEventListener("DOMContentLoaded", function(event) {
	chrome.storage.sync.get(['tickers'], function(result) {
	  if (result.tickers.length > 0) { tickers = result.tickers; }
	  else { tickers = []; }
	  
	  stock_up();
	});
	
	setup_init_listeners();
});

function stock_up() {
	let url = 'https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=' + tickers.join(',') + '&filter=symbol,change,latestPrice,changePercent';
	let info = {};
  
  fetch(url).then(res => res.json()).then(data => set_content(data));
}

function set_content(data) {
	$('.ticker_list').empty();
	$('.tickers_to_add').val('');
	
	prices = [];
	percentages = [];
	
	tickers.forEach(function(ticker) {
		if (data[ticker]) {
			let latest_price = parseFloat(data[ticker].quote.latestPrice).toFixed(2);
			let change_percent = parseFloat(data[ticker].quote.changePercent).toFixed(2);
			let markup = '<div class="ticker_container">';
			markup += '<button class="remove_ticker">✕</button>';
			markup += '<span class="ticker" data-change-percent="' + change_percent + '" data-latest-price="' + latest_price + '">' + ticker + ': $' + latest_price + '</span>';
			markup += '</div>';
			
			prices.push({'ticker':ticker, 'price':parseFloat(latest_price).toFixed(2)});
			percentages.push({'ticker':ticker, 'percentage':parseFloat(change_percent).toFixed(2)});
					
			$('.ticker_list').append(markup);
			
			let change = data[ticker].quote.change.toString();
					
			if (change.indexOf('-') != -1) { $('.ticker:last').addClass('down'); }
			else { $('.ticker:last').addClass('up'); }
		} else {
			console.log(ticker, ' is not a valid ticker');
			
			let index = tickers.indexOf(ticker);
			
			if (index !== -1) tickers.splice(index, 1);
		}
	});
	
	setup_event_listeners();
	save_tickers();
}

function setup_event_listeners() {
	$('button.remove_ticker').click(function() {
		$(this).parent().remove();
		
		let tt_info = $(this).next().text().trim();
		let temp_ticker = tt_info.substring(0, tt_info.indexOf(':'));
		let index = tickers.indexOf(temp_ticker);
		
		if (index !== -1) tickers.splice(index, 1);
		
		save_tickers();
	});
	
	
	$('.ticker').mouseover(function() {
		let symbol_info = $(this).text().trim();
		let symbol = symbol_info.substring(0, symbol_info.indexOf(':'));
		
		$(this).text(symbol + ': ' + $(this).attr('data-change-percent') + '%');
	});
	
	$('.ticker').mouseout(function() {
		let symbol_info = $(this).text().trim();
		let symbol = symbol_info.substring(0, symbol_info.indexOf(':'));
		
		$(this).text(symbol + ': $' + $(this).attr('data-latest-price'));
	});
}

function validate_ticker_input(ticker_input) {
	let temp_tickers = [];
		
	ticker_input = ticker_input.toUpperCase().replace(/[^A-Z,+]/g, '');
		
	if (ticker_input.length > 0) {
		ticker_input = ticker_input.split(',');
		tickers = tickers.concat(ticker_input);
		
		tickers.forEach(function(ticker) {
			if (ticker.length > 0) {
				temp_tickers.push(ticker);
			}
		});
		
		tickers = temp_tickers;
	}
}

function add_tickers() {
	let tickers_to_add = $('.tickers_to_add').val().trim();
	
	if (tickers_to_add.length > 0) {
		validate_ticker_input($('.tickers_to_add').val().trim());
		
		stock_up();
	}
}

function save_tickers() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  //console.log('saving: ', tickers);
	});
}

function sorting_options() {
	if ($('.sorting_options').hasClass('closed')) {
		$('.sorting_options').addClass('open').removeClass('closed');
	} else if ($('.sorting_options').hasClass('open')) {
		$('.sorting_options').addClass('closed').removeClass('open');
	}
}

function setup_init_listeners() {
	$('.add_tickers').click(function() { add_tickers(); });
	$('.sorting_options_button').click(function() { sorting_options(); });
	
	$('.sorting_option_symbol').click(function() {
		let temporary_tickers = tickers.sort();
		
		if ($(this).hasClass('descending')) {
			$(this).addClass('ascending').removeClass('descending');
			$('.sorting_options_button').text('sort ⤒');
		} else if ($(this).hasClass('ascending')) {
			$(this).addClass('descending').removeClass('ascending');
			$('.sorting_options_button').text('sort ⤓');
			
			temporary_tickers.reverse();
		}
		
		tickers = temporary_tickers;
		
		stock_up();
	});
	
	$('.sorting_option_price').click(function() {
		let temporary_tickers = [];
		
		prices.sort(function(a, b) {
			return a.price - b.price;
		});
		
		prices.forEach(function(item) {
			temporary_tickers.push(item.ticker);
		});
		
		if ($(this).hasClass('descending')) {
			$(this).addClass('ascending').removeClass('descending');
			$('.sorting_options_button').text('sort ⤒');
		} else if ($(this).hasClass('ascending')) {
			$(this).addClass('descending').removeClass('ascending');
			$('.sorting_options_button').text('sort ⤓');
			
			temporary_tickers.reverse();
		}
		
		tickers = temporary_tickers;
		
		stock_up();
	});
	
	$('.sorting_option_percent').click(function() {
		let temporary_tickers = [];
		
		percentages.sort(function(a, b) {
			return a.percentage - b.percentage;
		});
		
		percentages.forEach(function(item) {
			temporary_tickers.push(item.ticker);
		});
		
		if ($(this).hasClass('descending')) {
			$(this).addClass('ascending').removeClass('descending');
			$('.sorting_options_button').text('sort ⤒');
		} else if ($(this).hasClass('ascending')) {
			$(this).addClass('descending').removeClass('ascending');
			$('.sorting_options_button').text('sort ⤓');
			
			temporary_tickers.reverse();
		}
		
		tickers = temporary_tickers;
		
		stock_up();
	});
}
