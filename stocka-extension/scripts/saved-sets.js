// saved ticker sets

// default saved symbol set
let saved_sets = [{ticker_set_name: "FANG", ticker_set: "FB,AMZN,NFLX,GOOGL", is_selected: true}];

// set up event listeners for existing html elements involving saved sets
function setup_saved_sets() {
	// open or close the save symbol sets panel
	$('.saved_sets').click(function() {
		options_sizing($('.saved_sets_container'));
		
		if ($('.saved_sets').attr('aria-expanded') ==='false') {
			$('.saved_sets').attr('aria-expanded', 'true');
			
			$('.saved_sets').find('a, button, input').eq(0).focus();
		} else {
			$('.saved_sets').attr('aria-expanded', 'false');
			
			$('.saved_sets').focus();
		}
	});
	
	// save the current symbol set
	$('.save_set').unbind('click').on('click', function() {
		// probably need to do more name input validation
		if ($('.saved_set_name').val().length > 0) {
			save_set(tickers, $('.saved_set_name').val());
		}
	});
	
	// delete current symbol set
	$('.delete_set').click(function() {
		delete_set(tickers.join());
	});
	
	// set up event listeners for populated set buttons and run an interface check
	setup_save_set_button_listeners();
	check_if_current_set_is_saved();
}

// setup event listeners for saved set buttons added to the document
function setup_save_set_button_listeners() {
	// when a saved set button is clicked
	$('.saved_set').click(function() {
		// load the set and update the interface
		load_selected_set($(this).attr('data-saved-set'));
		
		$('.saved_set').removeClass('.selected');
		$(this).addClass('.selected');
	});
	
	// when the saved set name input is [enter] keyed upon
	$('.saved_set_name').unbind('keydown').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			save_set(tickers, $('.saved_set_name').val());
		}
	});
}

// save the symbol set
function save_set(ticker_set, ticker_set_name) {
	// grab the variables necessary to build the new saved set object
	let new_saved_set_name = ticker_set_name;
	let new_saved_set = {"ticker_set_name":new_saved_set_name, "ticker_set":tickers.join(), 'is_selected':true};
	
	// turn off all other saved set 'selected' states
	saved_sets.forEach(function(each_saved_set) {
		each_saved_set.is_selected = false;
	});
	
	// push the new saved symbol set
	saved_sets.push(new_saved_set);
	
	// and sync with chrome
	sync_saved_sets();
}

// sync data with extension storage
function sync_saved_sets() {
	chrome.storage.sync.set({'saved_sets':saved_sets}, function() {
	  setup_saved_set_buttons();
	});
}

// delete saved symbol set
function delete_set(set_to_delete) {
	// compare each saved object to the current symbol set and splice out the matching one(s)
	saved_sets.forEach(function(each_set) {
		if (each_set.ticker_set == set_to_delete) {
			saved_sets.splice(saved_sets.indexOf(each_set), 1);
		}
	});
	
	// SYNC AGAIN BITCH
	sync_saved_sets();
	setup_saved_set_buttons();
}

// fill up the saved set containers
function setup_saved_set_buttons() {
	$('.list_of_saved_sets').empty();
	$('.saved_set_name').val('');
	
	saved_sets.forEach(function(item) {
		$('.list_of_saved_sets').append('<button class="saved_set" data-saved-set="' + item.ticker_set + '" aria-label="saved set: ' + item.ticker_set_name + '" tabindex="-1">' + item.ticker_set_name + '</button>');
	});
	
	if ($('.saved_sets_container').hasClass('open')) {
		$('.saved_set').attr('tabindex', '0');
	}
	
	// then setup listeners and check if current set matches any of 'em
	setup_save_set_button_listeners();
	check_if_current_set_is_saved();
}

// load up a saved symbol set when clicked
function load_selected_set(saved_set) {
	tickers = saved_set.split(',');
	
	$('.ticker_list').css('opacity', '0');
	
	setTimeout(function() {
		stock_up();
		check_if_current_set_is_saved();
	}, 500);
}

// determine whether or not the currently displayed symbol set matches any object in the saved symbol sets array
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