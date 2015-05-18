module.exports = {
    trade: function(io){
        var connectionCount = 0;
        io.sockets.on('connection', function (socket) {
            connectionCount++
            console.log('User connected - There are total ' + connectionCount + ' users online.');
            
            socket.emit('message', 'Welcome to Cannapay v1.0 Beta! ');

            socket.on('replay', function(replay){
                io.sockets.emit('globalMessage', '<p>System Message:<br>'+Date()+'</p>'+replay); 
            })

            socket.on('private', function(msg){
                io.sockets.emit('globalMessage', 'Recieved message "'+msg+'", that was fun! Socket.io FTW!');
            })

            socket.on('disconnect', function () {
                connectionCount--
                console.log('User disconnected - There are total ' + connectionCount + ' users online.');
            });
        });
    }
        
}