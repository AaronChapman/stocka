// saved ticker sets

let saved_sets = [{ticker_set_name: "FANG", ticker_set: "FB,AAPL,NFLX,GOOGL", is_selected: true}];

function setup_saved_sets() {
	$('.saved_sets').click(function() {
		if ($('.saved_sets_container').hasClass('closed')) {
			$('.saved_sets_container').removeClass('closed').addClass('open');
			$('.saved_sets_container').find('a, input, button').attr('tabindex', '0');
			
			$('.saved_sets_container').find('a, input, button').first().focus();
		} else {
			$('.saved_sets_container').removeClass('open').addClass('closed');
			$('.saved_sets_container').find('a, input, button').attr('tabindex', '-1');
			
			$('.saved_sets').focus();
		}
	});
	
	$('.save_set').click(function() {
		if ($('.saved_set_name').val().length > 0) {
			save_set(tickers, $('.saved_set_name').val());
		}
	});
	
	$('.delete_set').click(function() {
		delete_set(tickers.join());
	});
	
	setup_save_set_button_listeners();
	check_if_current_set_is_saved();
}

function setup_save_set_button_listeners() {
	$('.saved_set').click(function() {
		load_selected_set($(this).attr('data-saved-set'));
		
		$('.saved_set').removeClass('.selected');
		$(this).addClass('.selected');
	});
	
	$('.saved_set_name').unbind('keydown').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			save_set(tickers, $('.saved_set_name').val());
		}
	});
}

function save_set(ticker_set, ticker_set_name) {
	let new_saved_set_name = ticker_set_name;
	let new_saved_set = {"ticker_set_name":new_saved_set_name, "ticker_set":tickers.join(), 'is_selected':true};
	
	saved_sets.forEach(function(each_saved_set) {
		each_saved_set.is_selected = false;
	});
	
	saved_sets.push(new_saved_set);
	
	sync_saved_sets();
}

function sync_saved_sets() {
	chrome.storage.sync.set({'saved_sets':saved_sets}, function() {
	  setup_saved_set_buttons();
	});
}

function delete_set(set_to_delete) {
	saved_sets.forEach(function(each_set) {
		if (each_set.ticker_set == set_to_delete) {
			saved_sets.splice(saved_sets.indexOf(each_set), 1);
		}
	});
	
	sync_saved_sets();
	setup_saved_set_buttons();
}

function setup_saved_set_buttons() {
	$('.list_of_saved_sets').empty();
	$('.saved_set_name').val('');
	
	saved_sets.forEach(function(item) {
		$('.list_of_saved_sets').append('<button class="saved_set" data-saved-set="' + item.ticker_set + '" tabindex="-1">' + item.ticker_set_name + '</button>');
	});
	
	setup_save_set_button_listeners();
	check_if_current_set_is_saved();
}

function load_selected_set(saved_set) {
	tickers = saved_set.split(',');
	
	$('.ticker_list').css('opacity', '0');
	
	setTimeout(function() {
		stock_up();
		check_if_current_set_is_saved();
	}, 500);
}

function check_if_current_set_is_saved() {
	let current_set = tickers.join();
	let current_set_saved = false;
	
	$('.set_saved_status').removeClass('saved');
	$('.set_saved_status').text('UNSAVED');
	
	saved_sets.forEach(function(each_set) {
		if (each_set.ticker_set == current_set) {
			current_set_saved = true;
			
			$('.set_saved_status').addClass('saved');
			$('.set_saved_status').text(each_set.ticker_set_name);
		}
	});
}