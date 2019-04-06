// attach events to theme options
function setup_settings_listeners() {
	$('.open_settings').click(function() {
		open_settings();
	});
	
	$('.save_settings').click(function() {
		save_settings();
	});
	
	$('.theme_option').click(function() {
		// set current theme to clicked option
		current_theme = $(this).attr('data-theme-name');
		
		setup_theme(current_theme);
		save_tickers();
	});
	
	$('.market_performance_chart_type').click(function() {
		$('.market_performance_chart_type').removeClass('selected');
		$(this).addClass('selected');
		
		if ($(this).hasClass('bar')) {
			settings.market_performance_graph_type = 'bar';
		} else if ($(this).hasClass('line')) {
			settings.market_performance_graph_type = 'line';
		}
		
		if ($('.ticker_detail').hasClass('open')) {
			rechart(current_chart_data);
		}
	});
}

function setup_settings_states() {
	if (settings.market_performance_graph_type === 'bar') {
		$('.market_performance_chart_type.bar').addClass('selected');
	} else if (settings.market_performance_graph_type === 'line') {
		$('.market_performance_chart_type.line').addClass('selected');
	} 
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