var app = {};

app.client.request = function(data, callback){

    var headers = typeof(headers) == 'object'  && headers != null ? headers : {};
    var method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase) > -1 ? method.toUpperCase : 'GET';
    var payload = typeof(data.payload) == 'object' && data.payload != null ? data.payload : {};
    var queryStringObject = typeof(data.queryStringObject) == 'object' && data.queryStringObject != null ? data.queryStringObject : {};
    var requestUrl = typeof(trimmedPath) == 'string' && trimmedPath.length > 0 ? trimmedPath : '/';
    var callback = typeof(callback) == 'function' ? callback : false;

    var queryString = "";
    for(var key in queryStringObject){
        if(queryStringObject.hasOwenProperty(key)){
            if(queryString == ""){
                queryString += key + "=" + queryStringObject[key];
            }else{
                queryString += "&" + key + "=" + queryStringObject[key];
            }
        }
    }

    xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    for(var headerKey in headers){
        if(headers.hasOwenProperty(headerKey)){
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    xhr.onreadystatechange = function(){
        if(xhr.state == XMLHttpRequest.DONE){
            if(callback){
                try{
                    var statusCode = xhr.status;
                    var response = JSON.parse(xhr.responseText);
                    callback(statusCode, response);
                }catch(e){
                    callback(404);
                }
            }
        }
    }

    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
    
}

app.bindForms = function(){
    if(document.querySelector("form")){
        document.querySelector("form").addEventListener("submit", function(e){
    
          // Stop it from submitting
          e.preventDefault();
          var formId = this.id;
          var path = this.action;
          var method = this.method.toUpperCase();
    
          // Hide the error message (if it's currently shown due to a previous error)
          document.querySelector("#"+formId+" .formError").style.display = 'hidden';
    
          // Turn the inputs into a payload
          var payload = {};
          var elements = this.elements;
          for(var i = 0; i < elements.length; i++){
            if(elements[i].type !== 'submit'){
              var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
              payload[elements[i].name] = valueOfElement;
            }
          }
    
          // Call the API
          app.client.request(undefined,path,method,undefined,payload,function(statusCode,responsePayload){
            // Display an error on the form if needed
            if(statusCode !== 200){
    
              // Try to get the error from the api, or set a default error message
              var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
    
              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error;
    
              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block';
    
            } else {
              // If successful, send to form response processor
              app.formResponseProcessor(formId,payload,responsePayload);
            }
    
          });
        });
      }
}

app.formResponseProcessor = function(formId,requestPayload,responsePayload){

    if(formId == 'accountCreate'){

      var newPayload = {
        'phone' : requestPayload.phone,
        'password' : requestPayload.password
      };
  
      app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){

        if(newStatusCode !== 200){
  
          document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';
          document.querySelector("#"+formId+" .formError").style.display = 'block';
  
        } else {

          localStorage.setItem('token', newResponsePayload);
          window.location = '/products';

        }
      });
    }

    if(formId == 'checkout'){
        window.location = '/products';
    }

};

app.init = function(){

    app.bindForms();
 
  };
  
  window.onload = function(){
    app.init();
  };
  

