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

function setup_sorting_listeners() {
	$('.sorting_options_button').click(function() { options_sizing($('.sorting_options')); });
	
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