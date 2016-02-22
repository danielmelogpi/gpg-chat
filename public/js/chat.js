var appState = {
    idLocal: null,
    contatoRemoto: null,
    clientWorkerBase: "http://localhost:40550/gpg",
    io: socket,
    contacts: []
};

socket.on("select-identity", function() {
    console.log("will prompt user for identity");
    $.ajax(appState.clientWorkerBase + "/keys")
        .done(function(data) {
            console.log("identidades: ", data.keys);
            data.keys.forEach(function(key) {
                $("#identity-selection").append('<option value="'+key+'">'+key+'</option>')
            })
        });
    $.ajax(appState.clientWorkerBase + "/public-keys")
        .done(function(data) {
            console.log("known public keys:" , data.keys);
            appState.contatoRemoto = data.keys;
            data.keys.forEach(function(pubKey) {
                $("#destination").append('<option value="' + pubKey + '">' + pubKey + '</option>')
            });
        });
});

socket.on("received-new-message", function (encriptedMsg) {
    $.post(appState.clientWorkerBase + "/decrypt", {msg: encriptedMsg})
        .done(function(decripted) {
            console.log("received new message:", {msg: encriptedMsg})
            $("#chat-messages").append("<div class='msg msg-theirs'>" + decripted +"</div>");
        });
});


$("#identity-selected-btn").click(function(event) {
    var identity =$("#identity-selection").val();
    console.log("identitdade selecionada:", identity);
    appState.io.emit("identity-selected", {identity: identity});
    $("#identity-selection-holder").hide();
    $("#chat-area").removeClass("hidden");
});

$("#new-msg-send").click(function() {
    var msg = $("#new-msg-text").val();
    var email = $("#destination").val();
    $.post(appState.clientWorkerBase + "/encrypt", {msg: msg, email :email})
        .done(function(encrypted) {
            socket.emit("sent-new-msg", {msg: encrypted, email: email});
            console.log("sending new message", {msg: encrypted, email: email});
            $("#chat-messages").append("<div class='msg msg-mine'>" + msg +"</div>");
        });
});
