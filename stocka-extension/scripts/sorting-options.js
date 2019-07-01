function set_saved_sort(sort_type, sort_direction) {
	$('.sorting_option:contains(' + sort_type + ')').removeClass('unsorted ascending descending').addClass(sort_direction);
	$('.ticker_list').attr('data-displayed', sort_type);
	
	sort_update_interface($('.sorting_option:contains(' + sort_type + ')'));
	stock_up();
}

// update the ticker list based on the sortion option clicked
function sort_update_interface(sorting_option) {
	$('.sorting_option').each(function() {
		if ($(this).index() != sorting_option.index()) {
			$(this).removeClass('ascending descending').addClass('unsorted');
		}
	});
	
	settings.sort_type.option_type = sorting_option.text();
	settings.sort_type.option_direction = sorting_option.attr('class').split(' ')[2];
	
	sync_settings();
}

function sort_option_chosen(sorting_option) {
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

	sort_option_chosen(option_clicked);
	sort_update_interface(option_clicked);
}

function setup_sorting_listeners() {
	$('.sorting_options_button').click(function() { options_sizing($('.sorting_options')); });
	
	// sort ticker list by symbol
	$('.sorting_option_symbol').click(function() {
		sorting_option_clicked($(this), 'alphabetic', 'symbol', [], '');
	});
	
	
	
	function sorting_option_clicked(option_clicked, sort_type, data_displayed, data_array, attr_displayed) {
		$('.ticker_list').css('opacity', '0');
		
		setTimeout(function() {			
			temporary_tickers = tickers.sort();
			
			$('.ticker_list').attr('data-displayed', data_displayed);
			
			if (sort_type === "alphabetic") {
				sort_option_chosen(option_clicked);
				sort_update_interface(option_clicked);
			} else if (sort_type === "numeric") {
				sorting_option_number(data_array, option_clicked);
			}
			
			if (attr_displayed.length) {
				$('.ticker_list .ticker').each(function() {
					$(this).text($(this).attr('data-symbol') + ': ' + $(this).attr(attr_displayed));
					
					if (data_displayed === "percent") { $(this).text($(this).text() + ' %'); }
				});
			}
			
			tickers = temporary_tickers;
			
			stock_up();
		}, 500);
	}
	
	// sort ticker list by price
	$('.sorting_option_price').click(function() {
		sorting_option_clicked($(this), 'numeric', 'price', prices, 'data-latest-price');
	});
	
	
	// sort ticker list by price
	$('.sorting_option_change').click(function() {
		sorting_option_clicked($(this), 'numeric', 'change', changes, 'data-change');
	});
	
	// sort ticker list by price
	$('.sorting_option_percent').click(function() {
		sorting_option_clicked($(this), 'numeric', 'percent', percentages, 'data-change-percent');
	});
}