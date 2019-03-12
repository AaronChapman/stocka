// when the document has finished loading
document.addEventListener("DOMContentLoaded", function(event) {
	// check extension storage to see if ticker data exists and if so, update local variables
	chrome.storage.sync.get(['tickers'], function(result) {
	  if (result.tickers && result.tickers.length > 0) {
		  tickers = result.tickers;
		  
		  stock_up();
		// and stock up with default data if the install is fresh
		} else {
			tickers = default_tickers;
		
			stock_up();	
		}
	});
	
	// check this
	check_if_markets_are_open();
	
	// setup for pre-script element listeners
	setup_sorting_listeners();
	setup_detail_listeners();
	setup_ticker_list_listeners();
});