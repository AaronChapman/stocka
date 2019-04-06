// stocka for investors

document.addEventListener('DOMContentLoaded', function() {
  var show_upgrade = document.getElementById('show_upgrade');
  var request_upgrade = document.getElementById('request_upgrade');
  var cancel_upgrade = document.getElementById('cancel_upgrade');
  
  show_upgrade.addEventListener('click', function() {
	  $('.save_settings').click();
	  $('.detail_view_options.open .close_detail_view').click();
	  
	  show_upgrade_information();
  });
  
  cancel_upgrade.addEventListener('click', function() {
	  $('#show_upgrade').css('opacity', '1');
	  
	  hide_upgrade_information();
  });
  
  request_upgrade.addEventListener('click', function() {
	  buyProduct('stockaforinvestors');
  });
});

function show_upgrade_information() {
	$('.upgrade_information').addClass('visible');
}

function hide_upgrade_information() {
	$('.upgrade_information').removeClass('visible');
}



// upgrade flow
// step 1 - initialize process

function init() {
  getProductList();
}


// step 2 - fetch upgrade data from chrome store

function getProductList() {
  google.payments.inapp.getSkuDetails({
    'parameters': {env: "prod"},
    'success': onSkuDetails,
    'failure': onSkuDetailsFailed
  });
}


// step 3a - if data was found

function onSkuDetails(skus) {
	var product = skus.response.details.inAppProducts[0];
	
	//console.log(product);
    
  getLicenses();
}


// step 3b - if there was a problem loading the upgrade data

function onSkuDetailsFailed(response) {
	//console.log('failed to retrieve upgrade because');
  //console.log(response);
}


// step 4 - fetch the list of purchased products

function getLicenses() {
  google.payments.inapp.getPurchases({
    'parameters': {env: "prod"},
    'success': onLicenseUpdate,
    'failure': onLicenseUpdateFailed
  });
}


// step 5a - get the list of purchased products

function onLicenseUpdate(response) {
  var licenses = response.response.details;
  
  if (licenses.length < 1) {
	  console.log('looks like you don\'t have stocka for investors...\nsucks to suck');
  } else {
	  $('#show_upgrade').remove();
	  $('body').addClass('upgraded');
	  
	  upgraded = true;
	  
	  setup_upgraded_interface();
	  setup_notes();
	  
	  console.log('looks like you\'re using stocka for investors...\nsick');
  }
}


// step 5b - if something went wrong

function onLicenseUpdateFailed(response) {
  console.log('failed to update licenses because');
  console.log(response);
}


// step 6 - if user tries to upgrade

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


// start 'er up
init();