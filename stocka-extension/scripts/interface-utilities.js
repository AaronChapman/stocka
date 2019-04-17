// open (or close) the sorting options area
function options_sizing(container) {
	if (container.hasClass('closed')) {
		container.addClass('open').removeClass('closed');
		container.find('a, input, button').attr('tabindex', '0');
	} else if (container.hasClass('open')) {
		container.addClass('closed').removeClass('open');
		container.find('a, input, button').attr('tabindex', '-1');
	}
}

// do what the fuck it says bruh
function check_if_markets_are_open() {
	let current_date = new Date();
	let current_hour = current_date.getUTCHours();
	let current_minute = current_date.getUTCMinutes();
	let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let today = weekdays[current_date.getUTCDay()];
	let market_closed = false;
		
	// if it's a weekday
	if (today === "Saturday" || today === "Sunday") {
		market_closed = true;
	} else {
		// and the market isn't open
		if (current_hour <= market_open_hour_utc) {
			if (current_hour == market_open_hour_utc) {
				if (current_minute < market_open_minute_utc) {
					market_closed = true;
				}
			} else {
				market_closed = true;
			}
		} else if (current_hour >= market_close_hour_utc) {
			market_closed = true;
		}
	}
		
	// make the market closed message visible
	if (market_closed) {
		$('.market_closed_message').css('display', 'block');
	}
}

// switch out body's theme class
function setup_theme(theme_to_use) {
	themes.forEach(function(theme) {
		if (theme == theme_to_use) { 
			$('body').attr('class', '');
			$('body').addClass(theme_to_use);
			
			if (upgraded) {
				$('body').addClass('upgraded');
				
				if ($('.ticker_detail').hasClass('open')) {
					rechart(current_chart_data);
				}
			}
		}
	});
}

// put together additional interface elements for my lovely paying users
function setup_upgraded_interface() {
	add_settings();
	add_chart();
	add_saved_sets();
}

// add extra themes to settings menu
function add_settings() {
	$('.theme_option_container:last').after('<div class="theme_option_container"><button class="theme_option classic" data-theme-name="classic" aria-label="theme option: classic" tabindex="-1"></button><span class="theme_name">classic</span></div><div class="theme_option_container"><button class="theme_option midnight" data-theme-name="midnight" aria-label="theme option: midnight" tabindex="-1"></button><span class="theme_name">midnight</span></div>');
	
	$('.setting:last').after('<div class="setting market_performance_chart_type_setting"<span class="setting_category_title">chart:</span><hr><div class="graph_option_container"><button class="market_performance_chart_type bar" aria-label="market data chart type: bar graph" tabindex="-1">bar graph</button></div><div class="graph_option_container"><button class="market_performance_chart_type line" aria-label="market data chart type: line graph" tabindex="-1">line graph</button></div></div>');
	
	// and attach listeners to them
	setup_settings_listeners();
	setup_settings_states();
}

// add chart data to the detail view
function add_chart() {
	$('.ticker_detail_data').before('<div class="chart_container"><canvas id="change_chart" width="200" height="150"></canvas></div>');
}

function add_saved_sets() {
	$('.options_header').prepend('<button class="saved_sets" aria-label="saved sets panel" aria-expanded="false">saved sets</button>');
	
	setup_saved_set_buttons();
	setup_saved_sets();
}

// format larger numbers
function number_with_commas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}