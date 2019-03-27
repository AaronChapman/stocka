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
	chrome.storage.sync.set({'tickers': tickers, 'notes':notes, 'theme':current_theme}, function() {
	  setTimeout(function() {
		  close_notes();
	  }, 250);
	});
}

function close_notes() {
	notes = $('.notes_field').html();
	
	$('.notes_container').addClass('closed').removeClass('open');
}