Home Work Assignment #4

Environment variables can be changed in config.ts.
For staging there are configuratons for stripe and mailgun. Please put your data

You can run the app by node index.js or NODE_ENV=staging node index.js

I have created cli.js under lib directory. I have added following commands in cli:

1. 'help': 'Alias of "man" command',
2. 'exit': 'Kill CLI and rest of the application.',
3. 'stats': 'SYSTEM STATISTICS',
4. 'menus items': 'View all the current menu items',
5. 'recent orders': 'View all the recent orders in the system (orders placed in the last 24 hours)',
6. 'order --{orderId}': 'Lookup the details of a specific order by order ID',
7. 'recent users': 'View all the users who have signed up in the last 24 hours',
8. 'user --{email}': 'Lookup the details of a specific user by email address'

For command 5 and 7 you have to change the date in data at .data/orders and .data/users files. I have done when I was testing. You have to set again when you have to test.