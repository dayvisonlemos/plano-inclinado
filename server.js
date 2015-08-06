var express = require('express');
var path = require('path');
//var dinamicaIno = require('./js/dinamica-ino');
//var arduino = dinamicaIno.arduino;
var app = express();
app.use('/', express.static(__dirname + '/'));
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/distance', function (req, res) {
    res.send(JSON.stringify(arduino.sensor));
});

app.get('/arduino/:deg', function (req, res) {
    
    var deg = parseInt(req.params.deg);
    /*arduino.moveTo(deg, function(o){
        res.send(JSON.stringify(o));
    });*/
    
    
    setTimeout(function(){
        res.send(JSON.stringify({start: 0, end: deg}));
    }, 3000);
    
});

app.get('/static', function (req, res) {
    
    arduino.staticFriction(function(o){
        res.send(JSON.stringify({'static-friction': o}));
    });
    
    /*
    setTimeout(function(){
        res.send(JSON.stringify({'static-friction': 74}));
    }, 3000);*/
    
});

app.listen(8080, '0.0.0.0');