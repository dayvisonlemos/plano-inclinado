/**
script responsavel pela utilizacao da biblioteca johnny-five
e disponibilzacao de metodos especificos para o plano inclinado.

autor: Dayvison Lemos <dayvison.lemos@gmail.com>
*/

/**
Biblioteca de comunicação com a placa Arduino
*/
var johnnyfive = require('johnny-five');


var Arduino = function () {

    var system = {
        /**
        Representa a placa Arduino UNO
        */
        arduino: undefined,
        /**
        Representa o sensor de proximidade
        */
        proximity: undefined,
        /**
        Servo Esquerda
        */
        leftServo: undefined,
        /**
        Servo Direita
        */
        rigthServo: undefined,
        /**
        dto sensor
        */
        sensor: {},
        /**
        Construtor
        */
        __inti: function () {

            var __this = this;

            //Faz a comunicacao com Arduino
            __this.arduino = new johnnyfive.Board({
                //Porta onde o Arduino está conectado. Encontrada no editor do arduino.
                port: 'COM6'
            });

            //Quando a conexao for estabelecida, execua o callback
            __this.arduino.on('ready', function () {
                //Inicia o sensor ultrassonico na porta digital 7
                __this.proximity = new johnnyfive.Ping({
                    pin: 7,
                    freq: 10,
                    pulse: 50
                });
                //Inicia o servo da esqueda na porta digital 4
                __this.leftServo = new johnnyfive.Servo(5);
                //Inicia o servo da direita na porta digital 6
                __this.rigthServo = new johnnyfive.Servo(6);

                __this.proximity.on('change', function (err, value) {
                    __this.sensor.distance = this.cm;
                });

                __this.moveTo(0);
            });
        },
        /**
        Move servos to a position
        */
        moveTo: function (position, callback) {

            var __this = this;
            var currentPosition = __this.leftServo.value;
            var posVariation = Math.abs(position - currentPosition);
            var duration = parseInt(((4000 * posVariation) / 180), null) / posVariation;

            if (duration == 0) {
                return false;
            }

            var o = {};
            o.start = currentPosition;
            o.end = position;

            if (position > currentPosition) {
                var intervalo = setInterval(function () {
                    currentPosition += 1;
                    __this.rigthServo.to(180 - currentPosition);
                    __this.leftServo.to(currentPosition);
                    if (currentPosition >= position) {
                        clearInterval(intervalo);
                        if (callback) {
                            callback(o);
                        }
                    }
                }, duration);
            } else {
                var intervalo = setInterval(function () {
                    currentPosition -= 1;
                    __this.rigthServo.to(180 - currentPosition);
                    __this.leftServo.to(currentPosition);
                    if (currentPosition <= position) {
                        clearInterval(intervalo);
                        if (callback) {
                            callback(o);
                        }
                    }
                }, duration);
            }
            return true;
        },
        staticFriction: function (callback) {
            var __this = this;
            var position = 50;
            var boxPosition = __this.sensor.distance;
            __this.moveTo(position);
            var friction = setInterval(function () {
                if (__this.sensor.distance < (boxPosition - 2)) {
                    position -= 8;
                    __this.rigthServo.to(180 - position);
                    __this.leftServo.to(position);
                    clearInterval(friction);
                    callback((position - 4));
                } else {
                    position += 4;
                    __this.rigthServo.to(180 - position);
                    __this.leftServo.to(position);
                }

            }, 500);
        }
    };

    system.__inti();
    return system;
};
var a = new Arduino();
exports.arduino = a;
