var five = require("johnny-five");
var board = new five.Board({
	port: "COM6"
});

//Visto a partir do cateto oposto ao angulo
var servoEsquerda;// = { to: function(deg){ console.log(deg); }, value: 20};
var servoDireita;// = { to: function(deg){ console.log(deg); }, value: 20};
board.on('ready', function(){
	servoDireita = new five.Servo(6);
	servoEsquerda = new five.Servo(4);
	servoDireita.to(180);
	servoEsquerda.to(0);
});

var express = require('express');
var app = express();
app.get('/', function (req, res) {
  res.send('Hello World');
});

app.get('/arduino/:deg', function (req, res) {
	res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	
	var angle = parseInt(req.params.deg);
	var currentDeg = servoEsquerda.value;
	var dDeg = Math.abs(angle-currentDeg);
	var duration = parseInt(((4000*dDeg)/138), null)/dDeg;
	if(duration > 0) {
		var o = {};
		o.start = currentDeg;
		o.end = angle;
		if(angle > currentDeg){
			var intervalo = setInterval(function(){
				currentDeg += 1;
				servoDireita.to(180-currentDeg);
				servoEsquerda.to(currentDeg);				
				console.log(currentDeg);
				if(currentDeg >= angle){
					clearInterval(intervalo);
					res.send(JSON.stringify(o));
				}
			}, duration);
		}else{
			var intervalo = setInterval(function(){
				currentDeg -= 1;
				servoDireita.to(180-currentDeg);
				servoEsquerda.to(currentDeg);
				console.log(currentDeg);
				if(currentDeg <= angle){
					clearInterval(intervalo);
					res.send(JSON.stringify(o));
				}
			}, duration);
	}
	}else{
		res.send("Mesmo angulo enviado");
	}
})
app.listen(3000);