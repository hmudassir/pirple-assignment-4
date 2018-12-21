/*
*
Dependencies
* 
*/
var server = require('./lib/server');

var cli = require('./lib/cli');

//Instantiate app module
var app = {};

app.init = function(){
    server.init();

    setTimeout(function(){
        cli.init();
    }, 100);
}

app.init();

//Export app module
module.exports = app;