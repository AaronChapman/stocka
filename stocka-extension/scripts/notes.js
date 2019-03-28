function setup_notes() {
	$('.open_notes').click(function() {
		open_notes(notes);
	});
	
	$('.save_notes').click(function() {
		save_notes(notes);
	});
}

function open_notes(notes) {
	$('.open_notes').css('opacity', '0');
	$('.notes_field').html(notes);
	$('.notes_container').addClass('open').removeClass('closed');
}

function save_notes(note_content) {
	$('.open_notes').css('opacity', '1');
	
	notes = $('.notes_field').html();
	
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme}, function() {
	  $('.notes_container').addClass('closed').removeClass('open');
	});
}