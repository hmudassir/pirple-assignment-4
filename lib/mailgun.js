var https = require('https');
var queryString = require('querystring');

var config = require('./config');

var mailgun = {};

mailgun.send = function(to, subject, text, callback){

    var protocol = typeof(config.mailgun.protocol) == 'string' && config.mailgun.protocol.trim().toLowerCase() == 'https' ? 'https:' : 'http:';
    var hostname = typeof(config.mailgun.hostname) == 'string' && config.mailgun.hostname.trim().length > 0 ? config.mailgun.hostname.trim() : false;
    var basePath = typeof(config.mailgun.path) == 'string' && config.mailgun.path.trim().length > 0 ? config.mailgun.path.trim() : false;
    var token = typeof(config.mailgun.token) == 'string' && config.mailgun.token.trim().length > 0 ? config.mailgun.token.trim() : false;
    var from = typeof(config.mailgun.from) == 'string' && config.mailgun.from.trim().length > 0 ? config.mailgun.from.trim() : false;
    var postData = {
        'from': from,
        'to': to,
        'subject': subject,
        'text': text
    };
    var queryStringData = queryString(postData);

    var requestDetails = {

        'protocol': protocol,
        'hostname': hostname,
        'port': 443,
        'path': basePath + config.mailgun.token + ".mailgun.org/messages",
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': queryStringData.length,
            'Authorization': 'Bearer ' + Buffer.from(config.mailgun.token).toString('base64')
        }

    };

    var req = https.request(requestDetails, function(res){

        var resData = '';
        res.on('error', function(){
            callback(500, {'Error': 'Unable to send email.'});
        });
        res.on('data', (data) => {
            resData += data;
        });

        res.on('end', () => {
            try{
                callback(false, resData);
            }catch(error){
                callback(500, {'Error': 'Unable to send email.'});
            };
        });

    });

    req.on('error', function(error){
        callback(500, {'Error': 'Unable to send email.'});
    });
    req.write(queryStringData);
    req.end();

    

}

module.exports = mailgun;