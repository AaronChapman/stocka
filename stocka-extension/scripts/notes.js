function setup_notes() {
	$('.open_notes').click(function() {
		open_notes(notes);
	});
	
	$('.save_notes').click(function() {
		save_notes(notes);
	});
}

function open_notes(notes) {
	$('.notes_field').html(notes);
	$('.notes_container').addClass('open').removeClass('closed');
}

function save_notes(note_content) {
	notes = $('.notes_field').html();
	
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme}, function() {
	  $('.notes_container').addClass('closed').removeClass('open');
	});
}