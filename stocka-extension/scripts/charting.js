// display visually charted data for the symbol over the given timeframe
function chart_data(data, graph_type) {
	current_chart_data = data;
	
	// get a reference to the html5 canvas
	let chart_container = $('#change_chart');
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
		chart_values.push(item.close);
		
		// determine the day's bar color
		if (temp_last_close < parseFloat(item.close)) {
			bar_colors.push(bar_color_up);
		} else {
			bar_colors.push(bar_color_down);
		}
		
		// update comparator
		temp_last_close = parseFloat(item.close);
	});
	
	if (graph_type === 'bar') {
		// create chart in the canvas with the appropriate attribute values
		var change_chart = new Chart(chart_container, {
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
		
		if ($('.ticker_detail').hasClass('down')) {
			graph_background_color = bar_color_down;
		} else {
			graph_background_color = bar_color_up;
		}
		
		var change_chart = new Chart(chart_container, {
	    type: 'line',
	    data: {
		    labels: chart_values,
	      datasets: [{
	        label: 'share price',
	        data: chart_values,
	        backgroundColor: graph_background_color,
	        pointBackgroundColor: bar_color_down,
	        pointBorderColor: bar_color_down,
	        pointBorderWidth: 0.5,
	        pointRadius: 1
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