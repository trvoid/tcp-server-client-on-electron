var net = require('net');

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

function getConn(host, port) {
    var option = {
        host: host,
        port: port
    }
    logDebug('111');
    var clientSock = net.createConnection(option, function () {
        logDebug('Connection local address: ' + clientSock.localAddress + ":" + clientSock.localPort);
        logDebug('Connection remote address: ' + clientSock.remoteAddress + ":" + clientSock.remotePort);
        $('#connectButton').val('Disconnect');
    });
    logDebug('222');
    clientSock.setTimeout(5000);
    clientSock.setEncoding('utf8');

    clientSock.on('data', function (data) {
        data = data.replace(/^\s+|\s+$/g, '');
        logReceived(data);
    });

    clientSock.on('close', function () {
        logDebug('Connection closed.');
        client = null;
        $('#connectButton').val('Connect');
    });

    clientSock.on('end', function () {
        logDebug('Connection ended.');
        client = null;
        $('#connectButton').val('Connect');
    });

    clientSock.on('timeout', function () {
        logDebug('Connection timeout.');
    });

    clientSock.on('error', function (err) {
        logDebug(JSON.stringify(err));
        client = null;
    });

    return clientSock;
}

function onConnectClick() {
    if (client == null) {
        logDebug('connec1111');
        host = $('#host').val().trim();
        if (host.length == 0) {
            logDebug('Host is empty.');
            return;
        }

        portStr = $('#port').val().trim();
        if (portStr.length == 0) {
            logDebug('Port is empty.');
            return;
        }
        port = parseInt(portStr, 10);

        client = getConn(host, port);
    } else {
        logDebug('connec2222');
        client.end();
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
