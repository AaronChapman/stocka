// saved ticker sets

let saved_sets = [{"ticker_set_name":"default", "ticker_set":tickers, 'is_selected':true}, {"ticker_set_name":"FANG", "ticker_set":"FB,AAPL,NTFX,GOOG", 'is_selected':false}];

function setup_saved_sets() {
	$('.saved_sets').click(function() {
		$('.saved_sets_container').addClass('open').removeClass('closed');
	});
	
	$('.saved_set').click(function() {
		load_selected_set($(this).attr('data-saved-set'));
		
		$('.saved_set').removeClass('.selected');
		$(this).addClass('.selected');
	});
	
	$('.save_set').click(function() {
		save_set();
	});
	
	$('.name_and_save_set').click(function() {
		if ($('.new_saved_set_name').val().length > 0) {
			confirm_save_set(tickers, $('.new_saved_set_name').val());
		}
	});
}

function save_set() {
	$('.set_naming_container').addClass('open').removeClass('closed');
}

function confirm_save_set(ticker_set, ticker_set_name) {
	let new_saved_set_name = ticker_set_name;
	let new_saved_set = {"ticker_set_name":new_saved_set_name, "ticker_set":tickers.join(), 'is_selected':true};
	
	saved_sets.forEach(function(each_saved_set) {
		each_saved_set.is_selected = false;
	});
	
	saved_sets.push(new_saved_set);
	
	chrome.storage.sync.set({'saved_sets':saved_sets}, function() {
	  setup_saved_set_buttons($('.new_saved_set_name').val(), new_saved_set);
	});
}

function setup_saved_set_buttons(new_set_name, new_set) {
	$('.saved_sets_container').empty();
	$('.new_saved_set_name').val('');
	
	saved_sets.forEach(function(item) {
		$('.saved_sets_container').append('<button class="saved_set" data-saved-set="' + new_set + '">' + new_set_name + '</button>');
	});
}

function load_selected_set(saved_set) {
	tickers = saved_set.split(',');
	
	// do a fancy transition like the sort one
	stock_up();
}