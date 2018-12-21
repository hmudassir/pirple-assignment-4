var readline = require('readline');
var util = require('util');
var events = require('events');
class _events extends events {};
var e = new _events();
var os = require('os');
var v8 = require('v8');

var _data = require('./data');
var menus = require('./menus');

var cli = {};

cli.verticalSpace = function(lines){
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
    for(var i=0; i < lines; i++){
        console.log('');
    }
}

cli.horizontalLine = function(){
    
    var width = process.stdout.columns;

    var line = '';
    for(var i=0; i<width; i++){
        line += '-';
    }

    console.log(line);
}

cli.centered = function(str){

    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';
    var strLength = str.length;
    var width = Math.floor((process.stdout.columns - strLength)/2);
    var line = "";
    for(var i = 0; i < width; i++){
        line += " ";
    }
    line += str;
    
    console.log(line);


}

cli.header = function(title){

    cli.horizontalLine();
    cli.centered(title);
    cli.horizontalLine();
    cli.verticalSpace(2);

}


cli.processInput = function(str){

    str = typeof(str) == 'string' && str.length > 0 ? str : false;

    if(str){
        var uniqueInputs = [

            'help',
            'exit',
            'stats',
            'menu items',
            'recent orders',
            'order',
            'recent users',
            'user'

        ];
        var matchFound = false;
        uniqueInputs.some(function(input){
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                e.emit(input, str);
                return true;
            }
        });
        if(!matchFound){
            console.log("Sorry, try again");
        }
    }
};


e.on('help', function(str){
    cli.responders.help(str);
});

e.on('exit', function(str){
    cli.responders.exit(str);
});

e.on('stats', function(str){
    cli.responders.stats(str);
});

e.on('menu items', function(str){
    cli.responders.menu_items(str);
});

e.on('recent orders', function(str){
    cli.responders.recent_orders(str);
});

e.on('order', function(str){
    cli.responders.order(str);
});

e.on('recent users', function(str){
    cli.responders.recent_users(str);
});

e.on('user', function(str){
    cli.responders.user(str);
});

cli.responders = {};

cli.responders.help = function(){
    var commands = {
        'help': 'Alias of "man" command',
        'exit': 'Kill CLI and rest of the application.',
        'stats': 'SYSTEM STATISTICS',
        'menus items': 'View all the current menu items',
        'recent orders': 'View all the recent orders in the system (orders placed in the last 24 hours)',
        'order --{orderId}': 'Lookup the details of a specific order by order ID',
        'recent users': 'View all the users who have signed up in the last 24 hours',
        'user --{email}': 'Lookup the details of a specific user by email address'
    };
    cli.header("CLI Manual");
    for(var key in commands){
        if(commands.hasOwnProperty(key)){
            console.log("\x1b[36m"+key+"\x1b[0m", ": "+commands[key]);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace();
    cli.horizontalLine();
}

cli.responders.exit = function(){
   process.exit(0);
}

cli.responders.stats = function(){
    var stats = {
        'Load Average': os.loadavg().join(' '),
        'CPU Count': os.cpus().length,
        'Free Memory': os.freemem(),
        'Current Mallocated Memory': v8.getHeapSpaceStatistics().mallocated_memory,
        'Peak Mallocated Memory': v8.getHeapSpaceStatistics().peak_mallocated_memory,
        'Allocated Heap Used (%)': Math.round((v8.getHeapSpaceStatistics().used_heap_size / v8.getHeapSpaceStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)': Math.round((v8.getHeapSpaceStatistics().total_heap_size / v8.getHeapSpaceStatistics().heap_size_limit) * 100),
        'Uptime': os.uptime() + ' Seconds'
    };
    cli.header("SYSTEM STATISTICS");
    for(var key in stats){
        if(stats.hasOwnProperty(key)){
            console.log('\x1b[34m'+key+'\x1b[0m', stats[key]);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace();
    cli.horizontalLine();
}

cli.responders.menu_items = function(){

    cli.header('All current menu items');
    if(menus && menus.length > 0){
        for(var i = 0; i < menus.length; i++){

            console.log("Title: " + menus[i].title + ", Description: " + menus[i].description + ", Amount: $" + menus[i].amount);
            cli.verticalSpace();
            cli.horizontalLine();
            cli.verticalSpace();

        }
    }

}

cli.responders.recent_orders = function(){

    cli.header('All the recent orders in the system (orders placed in the last 24 hours)');

    _data.list('orders', function(error, trimmedFileNames){

        if(!error && trimmedFileNames && trimmedFileNames.length > 0){
            cli.verticalSpace();
            cli.horizontalLine();
            cli.verticalSpace();
            var last24HoursDateTime = Date.now() - (1000 * 60 * 60 * 24);
            for(var i = 0; i < trimmedFileNames.length; i++){

                _data.read('orders', trimmedFileNames[i], function(error, orderData, fileName){
                    if(!error && orderData && orderData.length > 0){
                        orderData.forEach( (order, index) => {
                            if(order.date > last24HoursDateTime){
                                for(var j = 0; j < menus.length; j++){
                                    if(menus[j].id == order.menu_id){
                                        console.log( ( index + 1 ) + ". Order Id: " +fileName+  ", Menu Title: " + menus[j].title + ", Quantity: " + order.quantity + ", Amount: $" + menus[j].amount + ", Total Amount: $" + (order.quantity * menus[j].amount + ", Email: " + order.email));
                                        cli.verticalSpace();
                                        cli.horizontalLine();
                                        cli.verticalSpace();
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }

    });

}

cli.responders.order = function(str){
    
    var arr = str.split("--");
    var orderId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(orderId){
        var last24HoursDateTime = Date.now() - (1000 * 60 * 60 * 24);
        _data.read('orders', orderId, function(error, orderData){
            if(!error && orderData && orderData.length > 0){
                cli.header('Order Details');
                orderData.forEach(function(order, index){
                    if(order.date > last24HoursDateTime){
                        for(var j = 0; j < menus.length; j++){
                            if(menus[j].id == order.menu_id){
                                console.log((index +1) + ". Menu Title: " + menus[j].title + ", Quantity: " + order.quantity + ", amount: $" + menus[j].amount + ", Total Amount: $" + (order.quantity * menus[j].amount + ", Email: " + order.email));
                                cli.verticalSpace();
                                cli.horizontalLine();
                                cli.verticalSpace();
                            }
                        }
                    }
                });
            }
        });
    }else{
        console.log("Order Id is not defined. Please try again!");
    }

}

cli.responders.recent_users = function(str){
    cli.header('All the users who have signed up in the last 24 hours');
    _data.list('users', function(error, trimmedUsers){
        if(!error && trimmedUsers && trimmedUsers.length > 0){
            var dateTimeBefore24Hours = Date.now() - (1000 * 60 * 60 * 24);
            trimmedUsers.forEach(function(userId, index){
                _data.read('users', userId, function(error, userData){

                    if(!error && userData){
                        if(userData.date > dateTimeBefore24Hours){
                            console.log( (index + 1) + ". User Id: " +userId+ ", Name: " + userData.name + ", Email: " + userData.email);
                            cli.verticalSpace();
                            cli.horizontalLine();
                            cli.verticalSpace();
                        }
                        
                    }
                });
            });
        }
    });
};

cli.responders.user = function(str){
    var arr = str.split("--");
    var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(userId){
        cli.header('User Details');
        _data.read('users', userId, function(error, userData){
            if(!error && userData){
                console.log("Name: " + userData.name + ", Email: " + userData.email);
                cli.verticalSpace();
                cli.horizontalLine();
                cli.verticalSpace();
            }
        });
    }
    
    
}


cli.init = function(){

    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    });

    _interface.prompt();

    _interface.on('line', function(str){

        cli.processInput(str);
        _interface.prompt();

    });

    _interface.on('close', function(){
        process.exit(0);
    });

};

module.exports = cli;