/*
*
Dependencies
*
*/
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var config = require('./config');

//Instantiate Helpers module
var helpers = {};

//parse string/object to JSON object
helpers.parseJSONToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    }
}

helpers.hash = function(password){
    var hashedPassword = crypto.createHmac('sha256', 'thisissectretkey').update(password).digest('hex');
    return hashedPassword;
}

helpers.generateToken = function(){
    var token = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
    token += possible.charAt(Math.floor(Math.random() * possible.length));

    return token;
}

helpers.emailValidator = function(email){
    if(/\S+@\S+\.\S+/.test(email)){
        return true;
    }else{
        return false;
    }
}

helpers.mainTemplate = function(routerTemplate, data, callback){

    routerTemplate = typeof(routerTemplate) == 'string' && routerTemplate.length > 0 ? routerTemplate : '';
    data = typeof(data) == 'object' && data != null ? data : {};

    helpers.getTemplate('_header', data, function(error, headerTemplate){
        if(!error && headerTemplate && headerTemplate.length > 0){
            helpers.getTemplate('_footer', data, function(error, footerTemplate){

                if(!error && footerTemplate && footerTemplate.length > 0){
                    var fullTemplate = headerTemplate + routerTemplate + footerTemplate;
                    callback(200, fullTemplate);
                }else{
                    callback(500, {'Error': 'Error in footer template'});
                }

            });
        }else{
            callback(500, {'Error': 'Error in header template.'});
        }
    });
}

helpers.getTemplate = function(templateName, data, callback){

    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data != null ?  data : {};

    if(templateName){
        var baseDir = path.join(__dirname, './../templates/');
        fs.readFile(baseDir+templateName+".html", 'utf8', function(error, templateStr){
            if(!error && templateStr && templateStr.length > 0){
                var finalTempalte = helpers.interpolate(templateStr, data);
                    callback(200, finalTempalte);
            }else{
                callback(500, {'Error': 'There is error in template.'});
            }
        });
    }else{
        callback(500, {'Error': 'Template Name is required.'});
    }
}

helpers.interpolate = function(str, data){

    str  = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data != null ? data : {};

    for(var keyName in config.templateGlobals){
        if(config.templateGlobals.hasOwenProperty(keyName) && typeof(config.templateGlobals[keyName]) == 'string'){
            data['global.'+keyName] = config.templateGlobals[keyName];
        }
    }

    for(var key in data){
        if(data.hasOwenProperty(key) && typeof(data[key]) == 'string'){
            var find = '{' + key + '}';
            var replace = data[key];
            str.replace(find, replace);
        }
    }

    return str;
}

helpers.getStaticAsset = function(assetName, callback){
    
    assetName = typeof(assetName) == 'string' && assetName.length > 0 ? assetName : false;

    if(assetName){
        var assetDir = path.join(__dirname, './../public/');
        fs.readFile(assetDir+assetName, 'utf8', function(error, assetStr){
            if(!error && assetStr){

                callback(200, assetStr);

            }else{
                callback(500, {'Error': 'Error in reading asset file.'});
            }
        });
    }else{
        callback(500, {'Error': 'Error in reading asset.'});
    }
}


//Export helpers module
module.exports = helpers;