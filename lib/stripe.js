var https = require('https');
var querystring = require('querystring');

var config = require('./config');
var menus = require('./menus');
var mailgun = require('./mailgun');

var stripe = {};

stripe.payment = function(items, receipt_email, callback){
    var allItems = stripe.sumAllItems(items);
    var protocol = typeof(config.stripe.protocol) == 'string' && config.stripe.protocol.trim().toLowerCase() == 'https:' ? 'https:' : 'http:';
    var hostname = typeof(config.stripe.hostname) == 'string' && config.stripe.hostname.trim().length > 0 ? config.stripe.hostname.trim() : false;
    var charge = "?amount=" + allItems.amount + "&currency=" + config.stripe.currency + "&source=" + config.stripe.source + "&receipt_email=" + receipt_email + "&description=" + encodeURIComponent(allItems.description)
    var requestDetails = {
        'hostname': hostname,
        'port': '443',
        'protocol': protocol,
        'path': '/v1/charges',
        'method': 'POST',
        'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': charge.length,
                'Authorization': `Basic ${Buffer.from(config.stripe.secret_key).toString('base64')}:`,
            }
        };

    var req = https.request(requestDetails, function(res){
        var status =  res.statusCode;
        if(status == 200 || status == 201){
            mailgun.send(receipt_email, 'Order Payment Details', description, function(error, mailData){
                if(!error){
                    callback(false);
                }else{
                    callback(500, mailData);
                }
            });
        } else {
          callback('Status code returned was '+status);
        }
        
        });
        // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
        callback(e);
      });
  
      // Add the payload
      req.write(charge);
  
      // End the request
      req.end();
    
       
   // });
}

stripe.sumAllItems = function(items){
    var total_amount = 0;
    var description = "";
    var selectedMenus = items.split(",");
    var itemsCount = 0;
    for(var i = 0; i < selectedMenus.length; i++){
        for(var j = 0; j < menus.length; j++){
            if(menus[j].id == selectedMenus[i]){
                itemsCount++;
                total_amount += menus[j].amount;
                description += " "+itemsCount+".<b>"+menus[j].title+"</b>&nbsp;"+menus[j].amount+" <br/> ";
            }
        }
    }
    console.log("Result==>>", {'amount': total_amount, 'description': description});
    return {'amount': total_amount, 'description': description};
}

module.exports = stripe;