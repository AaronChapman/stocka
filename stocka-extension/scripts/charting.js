// display visually charted data for the symbol over the given timeframe
function chart_data(data, graph_type) {
	current_chart_data = data;
	
	// get a reference to the html5 canvas
	let chart_container = $('#share_price_chart');
	// create storage for the chart's values and styles
	let chart_values = [];
	let bar_colors = [];
	// grab ascending or descending day styling from hidden elements on the page
	let bar_color_up = $('.theme_to_chart .up').css('background-color');
	let bar_color_down = $('.theme_to_chart .down').css('background-color');
	// temporary value to determine directional gain
	let temp_last_close = 0;
		
	// for each value being charted
	data.forEach(function(item) {
		// push the closing price to the array of values
		chart_values.push(item.last);
		
		// determine the day's bar color
		if (temp_last_close < parseFloat(item.last)) {
			bar_colors.push(bar_color_up);
		} else {
			bar_colors.push(bar_color_down);
		}
		
		// update comparator
		temp_last_close = parseFloat(item.last);
	});
	
	if (share_price_chart != undefined) {
		share_price_chart.destroy();
	}
	
	if (graph_type === 'bar') {
		// create chart in the canvas with the appropriate attribute values
		share_price_chart = new Chart(chart_container, {
	    type: 'bar',
	    data: {
		    labels: chart_values,
	      datasets: [{
	        label: 'share price',
	        data: chart_values,
	        backgroundColor: bar_colors,
	        borderColor: 'white',
	        borderWidth: 0
	      }]
	    },
	    options: {
	      scales: {
	        yAxes: [{ ticks: { beginAtZero:false } }],
	        xAxes: [{ display:false  }]
	      },
				events: ['click'],
				legend: { display:false}
	    }
	  });
	} else if (graph_type === 'line') {
		let graph_background_color = 'rgba(00, 00, 00, 00)';
		let graph_point_color = 'rgba(00, 00, 00, 00)';
		
		if ($('.ticker_detail .ticker').hasClass('down')) {
			graph_background_color = bar_color_down;
			graph_point_color = bar_color_up;
		} else {
			graph_background_color = bar_color_up;
			graph_point_color = bar_color_down;
		}
		
		share_price_chart = new Chart(chart_container, {
	    type: 'line',
	    data: {
		    labels: chart_values,
	      datasets: [{
	        label: 'share price',
	        data: chart_values,
	        backgroundColor: graph_background_color,
	        pointBackgroundColor: graph_point_color,
	        pointBorderWidth: 0,
	        pointRadius: 2
	      }]
	    },
	    options: {
	      scales: {
	        yAxes: [{ ticks: { beginAtZero:false } }],
	        xAxes: [{ display:false  }]
	      },
				events: ['click'],
				legend: { display:false}
	    }
	  });
	}
}

// redraw charted data
function rechart(data) {
	if (upgraded) { chart_data(data, settings.market_performance_graph_type); }
}