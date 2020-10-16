// attach events to theme options
function setup_settings_listeners() {
	$('.open_settings').unbind('click').on('click', function() {
		open_settings();
	});
	
	$('.save_settings').unbind('click').on('click', function() {
		save_settings();
	});
	
	// set current theme to clicked (or keyed) option
	$('.theme_option_palette').unbind('click').on('click', function() {
		current_theme = $(this).attr('data-theme-name');
		settings.theme = current_theme;
		
		sync_settings();
		
		setup_theme(current_theme);
	});
	
	$('.theme_option_palette').unbind('keydown').on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			this.click();
		}
	});

	
	// when a chart type selection is made
	$('.market_performance_chart_type').click(function() {
		// visually set selected
		$('.market_performance_chart_type').removeClass('selected');
		$(this).addClass('selected');
		
		// update settings with correct value
		if ($(this).hasClass('bar')) {
			settings.market_performance_graph_type = 'bar';
		} else if ($(this).hasClass('line')) {
			settings.market_performance_graph_type = 'line';
		}
		
		// rechart data if the detail view is already opened
		if ($('.ticker_detail').hasClass('open')) {
			rechart(current_chart_data);
		}
	});
}

// setup selected states of settings items
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
	$('body').addClass('settings');
	$('.settings_container').find('a, button, input, [role="button"]').attr('tabindex', '0');
	
	$('.settings_container').find('button, [role="button"]').first().focus();
}

// save selected settings
function save_settings() {
	sync_settings();
	
	alert_user('saved settings');
	
	$('.settings_container').addClass('closed').removeClass('open');
	$('body').removeClass('settings');
	$('.settings_container').find('a, button, input, [role="button"]').attr('tabindex', '-1');
	$('.open_settings').css('opacity', '1');

	$('.open_settings').focus();
}