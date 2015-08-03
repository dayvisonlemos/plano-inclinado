var express = require('express');
var path = require('path');
// dinamicaIno = require('./js/dinamica-ino');
//var arduino = dinamicaIno.arduino;
var app = express();
app.use('/', express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

var allowOrigin = function(res){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
}

/*app.get('/distance', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send(JSON.stringify(sensor));
});*/

app.get('/arduino/:deg', function (req, res) {
    
    allowOrigin(res);

    var deg = parseInt(req.params.deg);
    arduino.moveTo(deg, function(o){
        res.send(JSON.stringify(o));
    });
});

app.get('/static', function (req, res) {
    
    allowOrigin(res);

    arduino.staticFriction(function(o){
        res.send(JSON.stringify({'static-friction': o}));
    });
});

app.listen(8080, '0.0.0.0');