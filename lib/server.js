/*
*
Dependencies
*
*/
//Use node built-in module
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

//Use self created modules
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./helpers');

//Instantiate server module
var server = {};

//Define http server
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
});

//handle reques and send response after callback from handler
server.unifiedServer = function(req, res){
    //parsed url to get requested route and query string objects
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    var queryStringObject = parsedUrl.query;
    var method = req.method.toLowerCase();
    var headers = req.headers;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data){
        buffer += decoder.write(data)
    });
    req.on('end', function(){
        buffer += decoder.end();
        var chosenHandlers = typeof(server.router[trimmedPath]) != 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        chosenHandlers = typeof(server.router[trimmedPath]) != 'undefined' && trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandlers;
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJSONToObject(buffer)
        };

        chosenHandlers(data, function(statusCode, payload, contentType){

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            var payloadString = '';
            if(contentType == 'json'){

                res.setHeader('Content-Type', 'application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);

            }else if(contentType == 'html'){

                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';

            }else if(contentType == 'favicon'){

                res.setHeader('Content-Type', 'image/x-icon');
                payloadString = typeof(payload) != 'undefined' ? payload : '';

            }else if(contentType == 'plain'){

                res.setHeader('Content-Type', 'text/plain');
                payloadString = typeof(payload) != 'undefined' ? payload : '';

            }else if(contentType == 'png'){

                res.setHeader('Content-Type', 'image/png');
                payloadString = typeof(payload) != 'undefined' ? payload : '';

            }else if(contentType == 'jpg'){

                res.setHeader('content-Type', 'image/jpeg');
                payloadString = typeof(payload) != 'undefined' ? payload : '';

            }else if(contentType == 'css'){

                res.setHeader('Content-Type', 'text/css');
                payloadString = typeof(payload) != 'undefined' ? payload : '';

            }

            res.writeHead(statusCode);
            res.end(payloadString);

        });
    });

}
//Define all possible routes to the system
server.router = {
    '': handlers.index,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'login': handlers.login,
    'logout': handlers.logout,
    'menus': handlers.menus,
    'order': handlers.order,
    'public': handlers.public
}

//define init function for server module
server.init = function(){

    server.httpServer.listen(config.httpPort, function(){
        console.log(config.envName + " Server is running at Port " + config.httpPort);
    });
}


module.exports = server;