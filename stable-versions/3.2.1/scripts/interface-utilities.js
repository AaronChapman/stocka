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

// stockalert functionality
function alert_user(alert_string) {
	$('.stockalert').text(alert_string);
	$('.stockalert').addClass('visible');
	
	setTimeout(function() { $('.stockalert').removeClass('visible'); }, 1750);
}

// format larger numbers
function number_with_commas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}