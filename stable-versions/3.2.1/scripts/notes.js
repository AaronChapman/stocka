// set up event listeners for the notes container
function setup_notes() {
	$('.bottom_options').prepend('<button class="open_notes">notes</button>');
	
	$('.open_notes').click(function() {
		open_notes(notes);
	});
	
	$('.save_notes').click(function() {
		save_notes(notes);
	});
}

// open the container and fill with notes data
function open_notes(notes) {
	$('.open_notes').css('opacity', '0');
	$('.notes_field').html(notes);
	$('.notes_container').addClass('open').removeClass('closed');
	$('.notes_container').find('a, button, input, [role="textbox"]').attr('tabindex', '0');
	
	$('.notes_container [role="textbox"]').focus();
}

// save notes
function save_notes(note_content) {
	notes = $('.notes_field').html();
	
	sync_notes();
	
	$('.open_notes').css('opacity', '1');
	$('.notes_container').addClass('closed').removeClass('open');
	$('.notes_container').find('a, button, input, [role="textbox"]').attr('tabindex', '-1');
		
	$('.open_notes').focus();
}