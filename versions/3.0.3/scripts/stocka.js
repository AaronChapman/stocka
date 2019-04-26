// when the document has finished loading
document.addEventListener("DOMContentLoaded", function(event) {
	// check extension storage to see if ticker data exists and if so, update local variables
	chrome.storage.sync.get(['tickers', 'saved_sets', 'notes', 'theme', 'settings'], function(result) {
		// load up synbol set
	  if (result.tickers && result.tickers.length > 0) {
		  tickers = result.tickers;
		  
		  stock_up();
		// and stock up with default data if data is absent
		} else {
			tickers = default_tickers;
		
			stock_up();	
		}
		
		// load up theme
		if (result.theme) {
		  current_theme = result.theme;
		} else {
			current_theme = 'sepia';
		}
		// load up notes
		if (result.notes) { notes = result.notes; }
		
		// load up settings
		if (result.settings) { settings = result.settings; }
		
		// load up saved sets
		if (result.saved_sets) { saved_sets = result.saved_sets; }
	});
	
	// set up theme styling
	$('body').addClass(current_theme);
	
	// initialize stocka for investors check
	getProductList();
	
	// determine whether or not to display a 'closed market' message
	check_if_markets_are_open();
	
	// setup... everything
	setup_sorting_listeners();
	setup_detail_listeners();
	setup_ticker_list_listeners();
	setup_settings_listeners();
	setup_saved_set_buttons();
	setup_saved_sets();
});