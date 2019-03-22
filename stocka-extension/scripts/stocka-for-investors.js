// stocka for investors

document.addEventListener('DOMContentLoaded', function() {
  var upgrade_stocka_button = document.getElementById('upgrade_stocka');
  
  upgrade_stocka_button.addEventListener('click', function() {
	  buyProduct('stockaforinvestors');
  });
});


// step 1 - initialize process

function init() {
  console.log('fetching upgrade information');
  
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
	console.log('failed to retrieve upgrade because');
  console.log(response);
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
	  $('#upgrade_stocka').addClass('visible');
  } else {
	  $('#upgrade_stocka').remove();
	  $('body').addClass('upgraded');
	  
	  upgraded = true;
	  
	  setup_upgraded_interface();
	  
	  console.log('looks like you\'re using stocka for investors... nice');
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
  var jwt = purchase.jwt;
  var cartId = purchase.request.cardId;
  var orderId = purchase.response.orderId;
  
  getLicenses();
}


// step 6b - if transaction didn't go through

function onPurchaseFailed(purchase) {
	var reason = purchase.response.errorType;
	
  console.log(reason.toLowerCase());
}


// start 'er up
init();