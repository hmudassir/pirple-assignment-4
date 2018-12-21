/*
*
Dependencies
*
*/
var fs = require('fs');
var path = require('path');

var _data = require('./data');
var helpers = require('./helpers');
var menus = require('./menus');
var stripe = require('./stripe');
//Instantiate handlers object
var handlers = {};

//Not Found handler
handlers.notFound = function(data, callback){
    callback(404);
}

handlers.index = function(data, callback){
    if(data.method == 'get'){
        var templateData = {
            'header.title': 'Home | Pirple Assignment',
            'header.description': 'Pirple Assignment Home Page',
            'body.title': 'Assignment # 3'
        };
        helpers.getTemplate('index', templateData, function(error, indexTemplate){
            if(!error && indexTemplate){
                helpers.mainTemplate(indexTemplate, templateData, function(error, str){
                    if(!error && str){
                        callback(false, str, 'html');
                    }else{
                        callback(500, undefined, 'html');
                    }
                });
            }else{
                callback(500, undefined, 'html');
            }
        });
    }else{
        callback(405);
    }
}

handlers.public = function(data, callback){
    if(data.method == 'get'){

        var fullAssetName = data.trimmedPath.replace("public/", "").trim();

        if(fullAssetName){

            var asset = fullAssetName.split(".");
            var assetType = typeof(asset[asset.length-1]) == 'string' && asset[asset.length-1].length > 0 ? asset[asset.length-1] : false;

            helpers.getStaticAsset(fullAssetName, function(error, assetStr){
                if(!error && assetStr){

                    var contentType = 'plain';

                    if(assetType == 'ico'){
                        contentType = 'favicon';
                    }

                    if(assetType == 'png'){
                        contentType = 'png';
                    }

                    if(assetType == 'jpg'){
                        contentType = 'jpeg';
                    }

                    if(assetType == 'css'){
                        contentType == 'css'
                    }
                    
                    callback(false, assetStr, contentType);
                }else{
                    callback(500, undefined, 'html');
                }
            });
        }else{
            callback(404);
        }

    }else{
        callback(405);
    }
}

//users handlers
handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'put', 'get', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405, {'Error': 'Requrested method is not supported'});
    }

}

handlers._users = {};

handlers._users.post = function(data, callback){
    var payload = data.payload;
    var name = typeof(payload.name) == 'string' && payload.name.trim().length > 0 ? payload.name.trim() : false;
    var email = typeof(payload.email) == 'string' && payload.email.trim().length > 0 && helpers.emailValidator(payload.email.trim()) ? payload.email.trim() : false;
    var street_address = typeof(payload.street_address) == 'string' && payload.street_address.trim().length > 0 ? payload.street_address.trim() : false;
    var password = typeof(payload.password) == 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false;
    if(name && email && street_address && password){
        _data.read('users', email, function(error, data){
            if(error){
                var hashedPassword = helpers.hash(password);
                if(hashedPassword){
                    var userObject = {
                        'name': name,
                        'email': email,
                        'hashedPassword': hashedPassword,
                        'street_address': street_address
                    };
                    _data.create('users', email, userObject, function(error){
                        if(!error){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Error in create User'});
                        }
                    });
                }else{
                    callback('Could\'t hash password.');
                }
            }else{
                callback(400, {'Error': 'User with that email already exist.'});
            }
        });
    }else{
        callback(500, {'Error': 'Missing required fields or Invalid email'});
    }
}

handlers._users.put = function(data, callback){

    var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && helpers.emailValidator(data.payload.email.trim()) ? data.payload.email.trim() : false;
    var street_address = typeof(data.payload.street_address) == 'string' && data.payload.street_address.trim().length > 0 ? data.payload.street_address.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    var token_id = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;

    if(token_id){

        handlers._tokens.verifyToken(token_id, email, function(error, data){
            if(!error){
                if(email){
                    _data.read('users', email, function(error, userData){
                        if(!error && userData){
                            if(name){
                                 userData.name = name;
                            }
                            if(street_address){
                                userData.street_address = street_address;
                            }
                            if(password){
                                userData.hashedPassword = helpers.hash(password);
                            }
                          _data.update('users', email, userData, function(error){
                                if(!error){
                                    callback(200);
                                }else{
                                    callback(error, {'Error': 'Unable to update user.'});
                                }
                            });
                        }else{
                            callback(500, {'Error': 'User doesn\'t exist with that email.'});
                        }
                    });  
                }else{
                    callback(500, {'Error': 'Valid email is required.'});
                }
            }else{
                callback(error, data);
            }
        });

    }else{
        callback(500, {'Error': 'Please add token.'})
    }

}

handlers._users.get = function(data, callback){
    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.emailValidator(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

    if(email){

        var token_id = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
        if(token_id){
            handlers._tokens.verifyToken(token_id, email, function(error, tokenData){
                if(!error){
                    _data.read('users', email, function(error, userData){
                        if(!error && userData){
                            delete userData.hashedPassword;
                            callback(200, userData);
                        }else{
                            callback(500, userData);
                        }
                    });
                }else{
                    callback(500, tokenData);
                }
            });
        }else{
            callback(500, {'Error': 'token is required'});
        }
    }else if(typeof(data.queryStringObject.email) == 'undefined'){
        callback(500, {'Error': 'Email is required.'});
    }else{
        callback(500, {'Error': 'Email is not valid.'});
    }
}

handlers._users.delete = function(data, callback){

    var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && helpers.emailValidator(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;
    if(email){

        var token_id = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
        if(token_id){
            handlers.verifyToken(token_id, email, function(error, tokenData){
                if(!error && tokenData){
                    _data.delete('users', email, function(error){
                        if(!error){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Error in delete user.'});
                        }
                    });
                }else{
                    callback(error, tokenData);
                }
            });
        }else{
            callback(500, {'Error': 'Please enter token'});
        }
    }else{
        callback(500, {'Error': 'Valid email is required.'});
    }
}


handlers.tokens = function(data, callback){
    var acceptedMethods = ['post', 'get', 'put', 'delete'];
    if(acceptedMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    }else{
        callback(405);
    }
}

handlers._tokens = {};

handlers._tokens.post = function(data, callback){
    
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && helpers.emailValidator(data.payload.email.trim()) ? data.payload.email.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if(email && password){
        _data.read('users', email, function(error, userData){
            if(!error && userData){
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){

                    var token_id = helpers.generateToken();
                    var expires = Date.now() + 1000 * 60 * 60 * 24;
                    var token_obj = {
                        'email': email,
                        'token_id': token_id,
                        'expires': expires
                    };

                    _data.create('tokens', token_id, token_obj, function(error){
                        if(!error){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Error in create Token'});
                        }
                    });
                }
            }else{
                callback(500, {'Error': 'User with that email doesn\'t exist.'});
            }
        });
    }
}

handlers._tokens.get = function(data, callback){

    var token_id = typeof(data.queryStringObject.token_id) == 'string' && data.queryStringObject.token_id.trim().length > 0 ? data.queryStringObject.token_id.trim() : fals;
    if(token_id){
        _data.read('tokens', token_id, function(error, tokenData){
            if(!error){
                callback(200, tokenData);
            }else{
                callback(500, {'Error': 'Token doesn\'t exist.'});
            }
        });
    }else{
        callback(500, {'Error': 'Error in token id.'});
    }
}

handlers._tokens.put = function(data, callback){
    var token_id = typeof(data.payload.token_id) == 'string' && data.payload.token_id.trim().length > 0 ? data.payload.token_id.trim() : 0;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if(token_id && extend){
        _data.read('tokens', token_id, function(error, tokenData){
            if(!error && tokenData){
                var expiryDate = tokenData.expires;
                if(expiryDate > Date.now()){
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', token_id, tokenData, function(error){
                        if(!error){
                            callback(200);
                        }else{
                            callback(500, {'Error': 'Error in token update.'});
                        }
                    });
                }else{

                }
            }else{
                callback(500, {'Error': 'Token id doesn\'t exist.'});
            }
        });
    }else{
        callback(400, {'Error': 'Missing required fields.'});
    }
}

handlers._tokens.delete = function(data, callback){
    var token_id = typeof(data.queryStringObject.token_id) == 'string' && data.queryStringObject.token_id.trim().length > 0 ? data.queryStringObject.token_id.trim() : false;
    if(token_id){
        _data.delete('tokens', token_id, function(error){
            if(!error){
                callback(200);
            }else{
                callback(500, {'Error': 'Token doesn\'t exist. '});
            }
        });
    }else{
        callback(500, 'Token is not valid.');
    }
}

handlers._tokens.verifyToken = function(token_id, email, callback){
    _data.read('tokens', token_id, function(error, tokenData){
        if(!error && tokenData){
            if(tokenData.email == email && tokenData.expires > Date.now()){
                callback(false, tokenData);
            }else{
                callback(500, {'Error': 'Token has expired.'});
            }
        }else{
            callback(400, {'Error': 'Missing required data.'});
        }
    });
}

handlers.login = function(data, callback){
    if(data.method == 'post'){
        handlers._tokens['post'](data, callback);
    }else{
        callback(405);
    }
}

handlers.logout = function(data, callback){

    if(data.method == 'get'){
        var token_id = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
        if(token_id){
            _data.delete('tokens', token_id, function(error){
                if(!error){
                    callback(200);
                }else{
                    callback(500, {'Error': 'Invalid token'});
                }
            });
        }else{
            callback(405, {'Error': 'Invalid token'});
        }
    }else{
        callback(405);
    }
}

handlers.menus = function(data, callback){
    if(data.method == 'get'){
        var token_id = typeof(data.headers.token) == 'string' ? data.headers.token.trim() : false;
        if(token_id){
            callback(200, {menus: menus});
        }else{
            callback(500, {'Error': 'Invalid Token'});
        }
    }else{
        callback(405);
    }
}

handlers.order = function(data, callback){
    if(data.method == 'post'){
        var items = typeof(data.payload.items) == 'string' && data.payload.items.trim().length > 0 ? data.payload.items.trim() : false;
        var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim().length > 0 : false;
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
        var address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
        if(items && name & phone && address){
             var token_id = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
             if(token_id){
                _data.read('tokens', token_id, function(error, tokenData){
                    if(!error && tokenData){
                        stripe.payment(items, 'hmmudassir82@gmail.com', function(error, data){
                            callback(200);
                        });
                     }else{
                         callback(500, tokenData);
                     }
                });
             }else{
                 callback(500, {'Error': 'Invalid token'});
             }
        }else{
            callback(500, {'Error': 'Missing required parameters'});
        }
    }else{
        callback(405);
    }
}



//Export handlers module
module.exports = handlers;