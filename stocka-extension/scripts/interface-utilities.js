// open (or close) the sorting options area
function options_sizing(container) {
	if (container.hasClass('closed')) {
		container.addClass('open').removeClass('closed');
	} else if (container.hasClass('open')) {
		container.addClass('closed').removeClass('open');
	}
}

function check_if_markets_are_open() {
	let current_date = new Date();
	let current_hour = current_date.getUTCHours();
	let current_minute = current_date.getUTCMinutes();
	let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	let today = weekdays[current_date.getUTCDay()];
	let market_closed = false;
		
	if (today === "Saturday" || today === "Sunday") {
		market_closed = true;
	} else {
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
		
	if (market_closed) {
		$('.market_closed_message').css('display', 'block');
	}
}

function number_with_commas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}