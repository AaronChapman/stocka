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
		if (result.settings && result.settings.theme) {
		  current_theme = result.settings.theme;
		} else {
			current_theme = 'sepia';
		}
		
		setup_theme();
		
		// load up notes
		if (result.notes) { notes = result.notes; }
		
		// load up settings
		if (result.settings) { 
			settings = result.settings; 
			
			//console.log(settings);
			if (result.settings && result.settings.sort_type) {
				//console.log('SETTING SAVED SORT FROM DATA');
				set_saved_sort(settings.sort_type.option_type, settings.sort_type.option_direction); 
				
			} else {
				//console.log('SETTING SAVED SORT FROM DEFAULT');
				settings.sort_type = {'option_type':'symbol', 'option_direction':'ascending'};
				
				//console.log(settings);
				set_saved_sort('symbol', 'ascending'); 
			}
		}
	});
}

function sync_symbol_set() {
	chrome.storage.sync.set({'tickers': tickers}, function() {
	  console.log('🔔 updated default symbol set');
	});
}

function sync_saved_sets() {
	chrome.storage.sync.set({'saved_sets':saved_sets}, function() {
		alert_user('updated saved sets');
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

// determine if an object has a given key
function has_key(object, key) {
  return object ? hasOwnProperty.call(object, key) : false;
}