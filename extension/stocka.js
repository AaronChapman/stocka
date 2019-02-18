let tickers = [];

function stock_up() {
	let url = 'https://api.iextrading.com/1.0/stock/market/batch?types=quote&symbols=' + tickers.join(',') + '&filter=symbol,change,latestPrice,changePercent';
	let info = {};
  
  fetch(url).then(res => res.json()).then(data => set_content(data));
}

function set_content(data) {
	$('.ticker_list').empty();
	$('.tickers_to_add').val('');
	
	tickers.forEach(function(ticker) {
		var markup = '<div class="ticker_container">';
		markup += '<button class="remove_ticker">✖</button>';
		markup += '<span class="ticker" data-change-percent="' + data[ticker].quote.changePercent + '" data-latest-price="' + data[ticker].quote.latestPrice + '">' + ticker + ': $' + data[ticker].quote.latestPrice + '</span>';
		markup += '</div>';
		
		console.log(data[ticker].quote.changePercent);
		
		$('.ticker_list').append(markup);
		
		let change = data[ticker].quote.change.toString();
				
		if (change.indexOf('-') != -1) { $('.ticker:last').addClass('down'); }
		else { $('.ticker:last').addClass('up'); }
	});
	
	setup_event_listeners();
	save_tickers();
	
	/*var move_tickers = setInterval(function() {
		activate_tickers();
	}, 7500);*/
}

function activate_tickers() {
	$('.ticker').each(function() {
		var ticker_size = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
		
		$(this).css('padding', '5px ' + ticker_size + '%' + '5px 5px');
	});
}

function add_tickers() {
	let tickers_to_add = $('.tickers_to_add').val().trim();
	
	if (tickers_to_add.length > 0) {
		validate_ticker_input($('.tickers_to_add').val().trim());
		
		stock_up();
	}
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
		
		$(this).text(symbol + ': ' + $(this).attr('data-latest-price'));
	});
}

function save_tickers() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  console.log('saving: ', tickers);
	});
}

$(document).ready(function() {
	chrome.storage.sync.get(['tickers'], function(result) {
	  if (result.tickers.length > 0) {
		  tickers = result.tickers;
	  } else {
		  tickers = [];
	  }
	  
	  stock_up();
	});
	
	$('.add_tickers').click(function() {
		add_tickers();
	});
	/*
	let event_listener_setup = setInterval(function() {
		if ($('button.remove_ticker').length === tickers.length) {
			clearInterval(event_listener_setup);
			
			setup_event_listeners();
		}
	}, 250);
	*/
});