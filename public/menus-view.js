var menus = require('../lib/menus');

var html = "<table ><tr><td colspan='4'>Products</td></tr><tr><th></th><th>Title</th><th>Description</th><th>Amount</th></tr>";

for(var i=0; i < menus.length; i++){
    html += "<tr><td><label><input type='checkbox' name='items' value='"+menus[i].id+"'></td><td>"+menus[i].title+"</td><td>"+menus[i].description+"</td><td>"+menus[i].amount+"</td></tr>";
}

html += "</table>";

document.getElementById('all_products').innerHTML = html;