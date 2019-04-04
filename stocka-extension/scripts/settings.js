// set up event listeners for settings containers
function setup_settings() {
	$('.open_settings').click(function() {
		open_settings();
	});
	
	$('.save_settings').click(function() {
		save_settings();
	});
}

// visually display settings container
function open_settings() {
	$('.open_settings').css('opacity', '0');
	$('.settings_container').addClass('open').removeClass('closed');
}

// save selected settings
function save_settings() {
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme, 'settings':settings}, function() {
	  $('.settings_container').addClass('closed').removeClass('open');
		$('.open_settings').css('opacity', '1');
	});
}