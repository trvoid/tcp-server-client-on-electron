var net = require('net');

var server = null;
var client = null;

function logSent(msg) {
    currentStr = $('#sent_msg').text();
    newStr = (currentStr.length == 0) ? msg : currentStr + '\n' + msg
    $('#sent_msg').text(newStr);
}

function logReceived(msg) {
    currentStr = $('#received_msg').text();
    newStr = (currentStr.length == 0) ? msg : currentStr + '\n' + msg
    $('#received_msg').text(newStr);
}

function logDebug(msg) {
    currentStr = $('#debug_msg').text();
    newStr = (currentStr.length == 0) ? msg : currentStr + '\n' + msg
    $('#debug_msg').text(newStr);
}

function createServer(port) {
    var serverSock = net.createServer(onClientConnected);

    serverSock.on('error', function(err) {
        logDebug('Server error: ' + err);
    });

    serverSock.on('close', function() {
        logDebug('Server stopped running.');
        server = null;
        $('#startButton').val('Start');
    });

    serverSock.listen(port, '0.0.0.0', function() {
        $('#startButton').val('Stop');
        logDebug('Server listening on ' + server.address().address + ':' + server.address().port);
    });

    return serverSock;
}

function onClientConnected(sock) {
    var remoteAddress = sock.remoteAddress + ':' + sock.remotePort;
    logDebug('Connection[' + remoteAddress + '] established.');

    sock.on('data', function(data) {
        data = data.toString('utf8').replace(/^\s+|\s+$/g, '');
        logReceived(data);
    });

    sock.on('close',  function () {
        client = null;
        logDebug('Connection[' + remoteAddress + '] closed.');
    });

    sock.on('error', function (err) {
        logDebug('Connection[' + remoteAddress + '] broken: ' + err.message);
    });

    client = sock;
}

function onStartClick() {
    if (server == null) {
        portStr = $('#port').val().trim();
        if (portStr.length == 0) {
            logDebug('Port is empty.');
            return;
        }
        port = parseInt(portStr, 10);

        server = createServer(port);
    } else {
        server.close();
    }
}

function onSendClick() {
    if (client != null) {
        var str = $('#sendText').val();
        client.write(str + '\r\n', 'UTF8', function() {
            logSent(str);
        });
    }
}

function onClearReceivedClick() {
    $('#received_msg').text('');
}

function onClearSentClick() {
    $('#sent_msg').text('');
}

function onClearDebugClick() {
    $('#debug_msg').text('');
}
