var net = require('net');
var dateFormat = require('dateformat');

var server = null;
var clients = {};

function logSent(msg) {
    var currentStr = $('#sent_msg').text();
    var dt = dateFormat(new Date(), 'yy-mm-dd hh:MM:ss');
    var msgLine = `<${dt}> <${msg}>`;
    var newStr = (currentStr.length == 0) ? msgLine : currentStr + '\n' + msgLine
    $('#sent_msg').text(newStr);
}

function logReceived(msg) {
    var currentStr = $('#received_msg').text();
    var dt = dateFormat(new Date(), 'yy-mm-dd hh:MM:ss');
    var msgLine = `<${dt}> <${msg}>`;
    var newStr = (currentStr.length == 0) ? msgLine : currentStr + '\n' + msgLine
    $('#received_msg').text(newStr);
}

function logDebug(msg) {
    var currentStr = $('#debug_msg').text();
    var dt = dateFormat(new Date(), 'yy-mm-dd hh:MM:ss');
    var msgLine = `<${dt}> <${msg}>`;
    var newStr = (currentStr.length == 0) ? msgLine : currentStr + '\n' + msgLine
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

    clients[remoteAddress] = sock;
    $('#clients').append(`<option value="${remoteAddress}">${remoteAddress}</option>`);

    sock.on('data', function(data) {
        data = data.toString('utf8').replace(/^\s+|\s+$/g, '');
        logReceived(data);
    });

    sock.on('close',  function () {
        logDebug('Connection[' + remoteAddress + '] closed.');
        delete clients[remoteAddress];
        $(`#clients option[value="${remoteAddress}"]`).remove();
    });

    sock.on('error', function (err) {
        logDebug('Connection[' + remoteAddress + '] broken: ' + err.message);
        delete clients[remoteAddress];
        $(`#clients option[value="${remoteAddress}"]`).remove();
    });
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
        for (var remoteAddress in clients) {
            clients[remoteAddress].end();
        }
        server.close();
    }
}

function onSendClick() {
    var selectedClient = $('#clients').val();
    if (selectedClient == null || selectedClient.length == 0) {
        logDebug('Client not selected');
        return;
    }

    var str = $('#sendText').val();
    clients[selectedClient].write(str + '\r\n', 'UTF8', function() {
        logSent(str);
    });
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
