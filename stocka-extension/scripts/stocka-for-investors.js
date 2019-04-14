// stocka for investors

// when the document loads
document.addEventListener('DOMContentLoaded', function() {
	// create references to the interface buttons dealing with upgrading
  var show_upgrade = document.getElementById('show_upgrade');
  var request_upgrade = document.getElementById('request_upgrade');
  var cancel_upgrade = document.getElementById('cancel_upgrade');
  
  // when the user wants to know more about upgrading, close any open panels and show the upgrade information
  show_upgrade.addEventListener('click', function() {
	  $('.save_settings').click();
	  $('.detail_view_options.open .close_detail_view').click();
	  
	  $('.upgrade_information').addClass('visible');
  });
  
  // if a user decides they don't actually want to upgrade, close the upgrade information panel
  cancel_upgrade.addEventListener('click', function() {
	  $('#show_upgrade').css('opacity', '1');
	  $('.upgrade_information').removeClass('visible');
  });
  
  // if an upgrade is requested via the upgrade information panel, trigger chrome payment interface
  request_upgrade.addEventListener('click', function() {
	  buyProduct('stockaforinvestors');
  });
});



// upgrade flow

// step 1 - fetch upgrade data from chrome store
function getProductList() {
  google.payments.inapp.getSkuDetails({
    'parameters': {env: "prod"},
    'success': onSkuDetails,
    'failure': onSkuDetailsFailed
  });
}

// step 2a - if data was found
function onSkuDetails(skus) {
	var product = skus.response.details.inAppProducts[0];
	
	//console.log(product);
    
  getLicenses();
}

// step 2b - if there was a problem loading the upgrade data
function onSkuDetailsFailed(response) {
	if (response.response.errorType === "INVALID_RESPONSE_ERROR") {
	  console.log('? :: local_setup');
  }
}

// step 3 - fetch the list of purchased products
function getLicenses() {
  google.payments.inapp.getPurchases({
    'parameters': {env: "prod"},
    'success': onLicenseUpdate,
    'failure': onLicenseUpdateFailed
  });
}

// step 4a - get the list of purchased products
function onLicenseUpdate(response) {
  var licenses = response.response.details;
  
  if (licenses.length < 1) {
	  console.log('thanks for using stocka!');
  } else {
	  $('#show_upgrade').remove();
	  $('body').addClass('upgraded');
	  
	  upgraded = true;
	  
	  setup_upgraded_interface();
	  setup_notes();
	  
	  console.log('looks like you\'re using stocka for investors...\nsick');
  }
}

// step 4b - if something went wrong
function onLicenseUpdateFailed(response) {
  console.log('failed to update licenses because');
  console.log(response);
}

// step 5 - if user tries to upgrade
function buyProduct(sku) {
  google.payments.inapp.buy({
    parameters: {'env': "prod"},
    'sku': sku,
    'success': onPurchase,
    'failure': onPurchaseFailed
  });
}

// step 6a - chrome handles transaction
function onPurchase(purchase) {
  /*var jwt = purchase.jwt;
  var cartId = purchase.request.cardId;
  var orderId = purchase.response.orderId;*/
  
  getLicenses();
}

// step 6b - if transaction didn't go through
function onPurchaseFailed(purchase) {
	var reason = purchase.response.errorType;
	
  console.log(reason.toLowerCase());
}

// local setup
function local_setup() {
	$('#show_upgrade').remove();
  $('body').addClass('upgraded');
  
  upgraded = true;
  
  setup_upgraded_interface();
  setup_notes();
}