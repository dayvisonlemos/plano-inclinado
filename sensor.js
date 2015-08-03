var five = require("johnny-five");
var board = new five.Board({
	port: "COM6"
});

board.on("ready", function() {
    var ping = new five.Ping(7);
    ping.on("change", function( err, value ) {
        console.log('Distance: ' + this.cm + ' cm');
    });
});