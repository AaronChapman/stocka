function load_saved_data() {
	chrome.storage.sync.get(['tickers', 'saved_sets', 'notes', 'theme', 'settings'], function(result) {
		// load up saved sets
		if (result.saved_sets) { saved_sets = result.saved_sets; }
		
		// load up synbol set
	  if (result.tickers && result.tickers.length > 0) {
		  tickers = result.tickers;
		// and stock up with default data if data is absent
		} else {
			tickers = default_tickers;
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
		if (result.settings) { 
			settings = result.settings; 
			
			set_saved_sort(settings.sort_type.option_type, settings.sort_type.option_direction); 
		}
	});
}

function sync_symbol_set() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  console.log('🔔 updated symbol set');
	});
}

function sync_saved_sets() {
	chrome.storage.sync.set({'saved_sets':saved_sets}, function() {
		alert_user('saved symbol set');
	});
}

function sync_notes() {
	chrome.storage.sync.set({'notes':notes}, function() {
	  alert_user('saved notes');
	});
}

function sync_settings() {
	chrome.storage.sync.set({'settings':settings}, function() {		
		console.log('💾 saved settings');
	});
}