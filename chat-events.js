var onlineUsers = {};

function loadEvents(io) {
    console.log("apply events to websocket");
    io.on("connection", function (socket) {
        console.log("user has connected");
        socket.emit("select-identity");
        socket.on("identity-selected", function(event) {
            onlineUsers[event.identity] = {
                loginTime: new Date(),
                socket: socket
            };
            console.log("online users:", onlineUsers);
        });

        socket.on("sent-new-msg", function(data) {
            console.log("new message sent", data.email, data.msg);
            var destination = onlineUsers[data.email];
            if (destination) {
                destination.socket.emit("received-new-message", data.msg);
            }
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });
}

module.exports = {
    loadEvents: loadEvents
};
