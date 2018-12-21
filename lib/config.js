/*
*
Dependencies
*
*/

//Instantiate environments module
var environments = {};

environments.staging = {
    'httpPort': 3000,
    'envName': 'staging',
    'stripe': {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'basePath': '/v1/charges/',
        'secret_key': 'sk_test_f8cySPzc8S9EXxmWbswkzHUD',
        'currency': 'usd',
        'source': 'tok_visa'
    },
    'mailgun': {
        'protocol': 'https',
        'port': 443,
        'hostname': 'api.mailgun.net',
        'path': '/v3/',
        'token': 'f8bb033940ffa578fb709aa012aef83e-52cbfb43-00dff5ee',
        'from': 'Mailgun Sandbox <postmaster@sandbox68fc718a070b4ce9a51217c1d6723a05.mailgun.org>',
        'to': 'Hafiz Muhammad Mudassir <hmmudassir82@gmail.com>'
    },
    'templateGlobals': {
        'appName': 'Pirple Assignments',
        'companyName': 'Pirple'
    }
}

environments.production = {
    'httpPort': 5000,
    'envName': 'production'
}

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;