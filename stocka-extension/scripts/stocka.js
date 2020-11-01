// when the document has finished loading
document.addEventListener("DOMContentLoaded", function(event) {
	alert_user('loading symbol set');
	
	// check extension storage to see if ticker data exists and if so, update local variables
	load_saved_data();
	
	// initialize stocka for investors check
	// moving to fremium?
	
	/* getProductList(); */
	
	local_setup();
	
	// setup... everything
	setup_sorting_listeners();
	setup_detail_listeners();
	setup_ticker_list_listeners();
	setup_settings_listeners();
	
	// put saved set content together
	setup_saved_set_buttons();
	setup_saved_sets();
	
	// determine whether or not to display a 'closed market' message
	check_if_markets_are_open();
	
	// set up theme styling
	$('body').addClass(current_theme);
});