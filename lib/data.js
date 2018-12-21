/*
*
Dependencies
* 
*/

var fs = require('fs');
var path = require('path');

var helpers = require('./helpers');
//Instantiate data module
var lib = {};

lib.baseDir = path.join(__dirname, './../.data/');

lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir+dir+"/"+file+".json", 'utf8', function(error, data){
        if(!error && data){
            callback(false, helpers.parseJSONToObject(data), file);
        }else{
            callback(500, {'Error': 'Error in read.'});
        }
    });
}

lib.create = function(dir, file, data, callback){
    fs.open(lib.baseDir+dir+"/"+file+".json", 'wx', function(error, fileDescriptor){
        if(!error && fileDescriptor){
            var stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, function(error){
                if(!error){
                    fs.close(fileDescriptor, function(error){
                        if(!error){
                            callback(false);
                        }else{
                            callback('Error in close file');
                        }
                    });
                }else{
                    callback('Error in writing file.');
                }
            });
        }else{
            callback('User with that email already exist');
        }
    });
}

lib.update = function(dir, file, data, callback){
    fs.open(lib.baseDir+dir+"/"+file+".json", 'r+', function(error, fileDescriptor){
        if(!error && fileDescriptor){
            fs.truncate(lib.baseDir+dir+"/"+file+".json", function(error){
                if(!error){
                    var stringData = JSON.stringify(data);
                    fs.writeFile(fileDescriptor, stringData, function(error){
                        if(!error){
                            fs.close(fileDescriptor, function(error){
                                if(!error){
                                    callback(false);
                                }else{
                                    callback('Error in close file.');
                                }
                            });
                        }else{
                            callback('Error in file writing.');
                        }
                    })
                }else{
                    callback('Error in truncate');
                }
            });
        }else{
            callback('Error in read file, user may not exist.');
        }
    });
}

lib.delete = function(dir, file, callback){
    fs.unlink(lib.baseDir+dir+"/"+file+".json", function(error){
        if(!error){
            callback(false);
        }else{
            callback('Error in delete file');
        }
    });
}

lib.truncate = function(dir, file, callback){
    fs.truncate(lib.baseDir+dir+"/"+file+".json", 0, function(error){
        if(!error){
            callback(false);
        }else{
            callback('Error in file truncate.');
        }
    });
}

lib.list = function(dir, callback){
    fs.readdir(lib.baseDir + dir + "/", function(error, data){
        if(!error && data && data.length > 0){
            var trimmedFileNames = [];
            data.forEach(function(fileName){
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        }else{
            callback(500);
        }
    });
}

//export data module
module.exports = lib;