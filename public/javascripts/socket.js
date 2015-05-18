var socket = io.connect('https://cannapay.io');
    
    socket.on('message', function (data) {
        socket.on('globalMessage', function(msg){
            alertify.error(msg, 0);
        });
        if(data.action === 'action1'){
            console.log('This was triggered from an action command from the server which can trigger other actions. This could also be data from an API!');
            doSomething('actions like console.log() -- like this!!!');
        } 
        if(data.action === 'action2'){
            var action = 'Or how about pulling data from a local DB like mongodb?';
            doSomething(action);
        } 
        if(!data.action){
            console.log(data);    
        }
    });

    socket.on('response', function (data) {
        console.log(data);
    });

function doSomething(data){
    console.log(data);
}