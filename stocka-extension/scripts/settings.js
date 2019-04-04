function setup_settings() {
	$('.open_settings').click(function() {
		open_settings(settings);
	});
	
	$('.save_settings').click(function() {
		save_settings(settings);
	});
}

function open_settings(notes) {
	$('.open_settings').css('opacity', '0');
	$('.settings_container').addClass('open').removeClass('closed');
}

function save_settings() {
	settings = current_settings();
	
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme, 'settings':settings}, function() {
	  $('.settings_container').addClass('closed').removeClass('open');
		$('.open_settings').css('opacity', '1');
	});
}

function current_settings() {
	return {};
}