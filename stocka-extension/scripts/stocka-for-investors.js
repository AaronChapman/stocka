// stocka for investors


/*
google.payments.inapp.getSkuDetails:
Returns an array of active items provided by your product from the Chrome Web Store. Maps to the Web Store API In-App Products List Method.

google.payments.inapp.buy:
Purchases an item.

google.payments.inapp.getPurchases:
Returns an array of items purchased by the user. Maps to the Web Store API Payments List Method.

google.payments.inapp.consumePurchase:
Consumes an item.

*/

function init() {
  console.log('extension initialization, getting upgrade information...');
  
  getProductList();
}

/*****************************************************************************
* get the list of available products from the chrome store
*****************************************************************************/

function getProductList() {
  console.log("retreiving list of available products...");
  
  google.payments.inapp.getSkuDetails({
    'parameters': {env: "prod"},
    'success': onSkuDetails,
    'failure': onSkuDetailsFailed
  });
}

function onSkuDetails(skus) {
	console.log('available:, 'skus.response.details.inAppProducts);
	console.log('single upgrade: ', skus.response.details.inAppProducts[0]);
	
	// depending on what is returned here
	
  //var products = skus.response.details.inAppProducts;
  
  var product = skus.response.details.inAppProducts[0];
  
  addProduct
  getLicenses();
}

function onSkuDetailsFailed(response) {
	console.log('failed to retrieve products');
  console.log("onSkuDetailsFailed", response);
}

/*function onSkuDetails(response) {
  console.log("onSkuDetails", response);
  
  var products = response.response.details.inAppProducts;
  var count = products.length;
  
  for (var i = 0; i < count; i++) {
    var product = products[i];
    
    console.log(product);
    //addProductToUI(product);
  }
  
  getLicenses();
}*/

/*****************************************************************************
* Get the list of purchased products from the Chrome Web Store
*****************************************************************************/

function getLicenses() {
  console.log('getting licenses');
  
  google.payments.inapp.getPurchases({
    'parameters': {env: "prod"},
    'success': onLicenseUpdate,
    'failure': onLicenseUpdateFailed
  });
}

function onLicenseUpdate(response) {
  console.log('updating purschases: ', response);
  
  var licenses = response.response.details;
  var count = licenses.length;
  
  console.log('purchases licenses: 'licenses);
  
  for (var i = 0; i < count; i++) {
    var license = licenses[i];
    
    addLicenseDataToProduct(license);
  }
}

function onLicenseUpdateFailed(response) {
  console.log("failed to update licenses", response);
}


/*****************************************************************************
* Purchase an item
*****************************************************************************/

function buyProduct(sku) {
  console.log("google.payments.inapp.buy", sku);
    
  google.payments.inapp.buy({
    parameters: {'env': "prod"},
    'sku': sku,
    'success': onPurchase,
    'failure': onPurchaseFailed
  });
}

function onPurchase(purchase) {
  console.log("onPurchase", purchase);
  
  var jwt = purchase.jwt;
  var cartId = purchase.request.cardId;
  var orderId = purchase.response.orderId;
  
  getLicenses();
}

function onPurchaseFailed(purchase) {
  console.log("onPurchaseFailed", purchase);
  
  var reason = purchase.response.errorType;
}

/*****************************************************************************
* Update/handle the user interface actions
*****************************************************************************/

function addProductToUI(product) {
  var row = $("<tr></tr>");
  var colName = $("<td></td>").text(product.localeData[0].title);
  var colDesc = $("<td></td>").text(product.localeData[0].description);
  var price = parseInt(product.prices[0].valueMicros, 10) / 1000000;
  var colPrice = $("<td></td>").text("$" + price);
  var butAct = $("<button type='button'></button>")
    .data("sku", product.sku)
    .attr("id", product_button_prefix + product.sku)
    .addClass("btn btn-sm")
    .click(onActionButton)
    .text("Purchase")
    .addClass("btn-success");
    
  var colBut = $("<td></td>").append(butAct);
  row
    .append(colName)
    .append(colDesc)
    .append(colPrice)
    .append(colBut);
    
  $("tbody").append(row);
}

function addLicenseDataToProduct(license) {
  var butAction = $("#" + product_button_prefix + license.sku);
  butAction
    .text("View license")
    .removeClass("btn-success")
    .removeClass("btn-default")
    .addClass("btn-info")
    .data("license", license);
}

function onActionButton(event) {
  console.log("onActionButton", event);
  
  var actionButton = $(event.currentTarget);
  
  if (actionButton.data("license")) {
    showLicense(actionButton.data("license"));
  } else {
    var sku = actionButton.data("sku");
    buyProduct(sku);
  }
}

function showLicense(license) {
  console.log("showLicense", license);
  
  var modal = $("#modalLicense");
  modal.find(".license").text(JSON.stringify(license, null, 2));
  modal.modal('show');
}

init();




/*****************************************************************************
* interface handling
*****************************************************************************/
