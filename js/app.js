//"use strict";

$.extend({
    currentDeg: 10,
    seno: function (angulo) {
        var rad = angulo * (Math.PI / 180);
        return Math.sin(rad);
    },
    coseno: function (angulo) {
        var rad = angulo * (Math.PI / 180);
        return Math.cos(rad);
    },
    tangente: function (angulo) {
        var rad = angulo * (Math.PI / 180);
        return Math.tan(rad);
    },
    sensor: undefined,
    detected: false,
    infinitesimalTime: undefined,
    currentPosition: 60,
    boxMass: 0.052, //kg
    weightForce: 0.052 * 9.8, //N
    boxWeight: 0.052 * 9.8 * 200,
    staticFriction: 0.18,
    moving: false,
    milliseconds: 0,
    seconds: 0,
    workingCronus: undefined
});

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/*setInterval(function () {

    $.get('/distance').done(function (data) {
        $.sensor = eval('[' + data + ']')[0];
        var distance = parseInt($.sensor.distance, null);
        if (distance < 54.00) {
            if (!$.detected) {
                $.detected = true;
                $('#caixa').trigger('detected', distance);
            }
            if (distance <= 50 && distance >= 10) {
                $('#caixa').trigger('move', distance);
                if (!$.moving) {
                    $.moving = true;
                    $.infinitesimalTime = [];
                    $.workingCronus = setInterval(function () {
                        $.milliseconds += 1;
                        var miliseconds = $.milliseconds % 100;
                        if (miliseconds === 0) {
                            $.seconds += 1;
                        }
                        $.infinitesimalTime.push({
                            position: $.sensor.distance,
                            milliseconds: $.milliseconds
                        });
                        $('#cronometro').text(pad($.seconds, 2) + ':' + pad(miliseconds, 2));
                    }, 10);
                }
            } else {
                if (distance < 10) {
                    $('#caixa').trigger('move', 0);
                    if ($.moving) {
                        $.moving = false;
                        clearInterval($.workingCronus);

                        var realTimes = [];
                        var lastPosition = 60;
                        for (var index in $.infinitesimalTime) {
                            var o = $.infinitesimalTime[index];
                            if (o.position < lastPosition) {
                                realTimes.push(o);
                                lastPosition = o.position;
                            }
                        }

                        if (realTimes.length > 0) {
                            var space = (50 - realTimes[realTimes.length - 1].position) / 100; //Transformando valor em metros
                            var time = realTimes[realTimes.length - 1].milliseconds / 100; //Transformando em segundos
                            var aceleracao = 2 * space / Math.pow(time, 2);
                            $('#input_aceleracao').val(parseFloat(aceleracao.toFixed(2)) + 'm/s2');

                            var inclinacao = parseInt($('#input_inclinacao').val());
                            var cac = parseFloat(Math.abs($.tangente(inclinacao) - (aceleracao / ($.coseno(inclinacao) * 9.8))).toFixed(2));
                            $('#input_atrito_cinetico').val(cac);

                        }
                    }
                }
                if (distance > 50) {
                    $.milliseconds = 0;
                    $.seconds = 0;
                    $.infinitesimalTime = undefined;
                    $('#cronometro').text('00:00');
                    $('#input_aceleracao').val('');
                    $('#input_atrito_cinetico').val('');
                }
            }

        } else {
            if ($.detected) {
                $.detected = false;
                $('#caixa').trigger('detected');
            }
        }
    });

}, 10);*/


var DinamicaIno = function () {

    var system = {
        init: function () {
            $('#caixa').on('detected', function (e, data) {
                var _this = $(this);
                if ($.detected) {
                    _this.show();
                    _this.css('left', ((945 * data) / 53) + 'px');

                } else {
                    _this.hide();
                }
            });

            $('#caixa').on('move', function (e, data) {
                var _this = $(this);
                _this.css('left', ((945 * data) / 53) + 'px');
            });

            $('#input_medidas').change(function () {
                system.mostrarMedidas(!$(this).is(':checked'));
            });

            $('#input_forcas').change(function () {
                system.mostrarDiagrama(!$(this).is(':checked'));
            });

            $('#input_inclinacao').change(function () {
                system.mover($(this).val());
            });


            $('#peso').css('height', $.boxWeight + 'px');
            $('#peso div').text('P: ' + parseFloat($.weightForce.toFixed(2)) + ' N');

            $('#input_medidas').trigger('change');
            $('#input_forcas').trigger('change');
            $('#input_inclinacao').trigger('change');
            $('#input_massa').val($.boxMass + ' kg');
        },
        mover: function (deg) {
            if (deg < 10 || deg > 32) {
                return;
            }
            var inclinacao = deg - 10;
            var rotacao = Math.abs((((141 * inclinacao) - 858) / 11) - 282);
            console.log('inclinação: ' + inclinacao);

            this.engrenagem(parseInt(rotacao, null));
        },
        engrenagem: function (deg) {
            console.log('rotação: ' + deg);
            var currentDeg = $('#engrenagem').data('current-deg');
            if (currentDeg === undefined) {
                currentDeg = 360;
            }

            var duration = 4000 * Math.abs(deg - currentDeg) / 360;

            $('#engrenagem').translate({
                deg: deg,
                currentDeg: currentDeg,
                duration: duration
            });
        },
        mostrarMedidas: function (show) {
            if (show) {
                $('.medidas').show();
            } else {
                $('.medidas').hide();
            }
        },
        mostrarDiagrama: function (show) {
            if (show) {
                $('.forcas').show();
            } else {
                $('.forcas').hide();
            }
        },
        atritoEstatico: function(elem){
            
            $.get('/static').done(function (data) {
                var result = eval('['+data+']')[0];
                console.log(result);
                var hDeg = parseInt(result['static-friction'], null);
                var staticFrictionDeg = parseInt((hDeg * 22 /180) + 10, null);
                $.staticFriction = parseFloat($.tangente(staticFrictionDeg)).toFixed(2);
                elem.html('<span style="font-size: 12px;">Coeficiente de Atrito Estático:</span>' + $.staticFriction);
                system.mover(staticFrictionDeg);
            
            });
            
        }
    };
    return system;
}

$.fn.translate = function (o) {
    var elem = $(this);
    var pos360 = 245
    var posAlavanca = 288;

    $({
        deg: o.currentDeg
    }).animate({
        deg: o.deg
    }, {
        duration: o.duration,
        step: function (now) {
            var pos = (2 * Math.PI * 40 * Math.abs(360 - now)) / 360;
            var alavancaDeg = ((1160 - 17 * now) / 80) + 68;
            var inclinacao = parseFloat((Math.abs((((11 * now) - 858) / 141) - 22)).toFixed(2));
            $(elem.selector).css({
                'right': (pos + pos360) + 'px',
                'transform': 'rotate(' + now + 'deg)'
            });
            $('#rotacao_alavanca').css({
                'right': (pos + posAlavanca) + 'px',
                'transform': 'rotate(' + alavancaDeg + 'deg)'
            });
            $('#rotacao_rampa').css({
                'transform': 'rotate(' + (360 - inclinacao) + 'deg)'
            });
            $('#rotacao_peso').css({
                'transform': 'rotate(' + (inclinacao + 10) + 'deg)'
            });

            $('#peso_x').css('width', $.boxWeight * $.seno(inclinacao + 10));
            var f_peso_x = parseFloat(($.weightForce * $.seno(inclinacao + 10)).toFixed(2));
            $('#peso_x div').text('Px: ' + f_peso_x + ' N');

            $('#peso_y').css('height', $.boxWeight * $.coseno(inclinacao + 10));
            $('#peso_y div').text('Py: ' + parseFloat(($.weightForce * $.coseno(inclinacao + 10)).toFixed(2)) + ' N');

            var f_atrito = parseFloat(($.weightForce * $.coseno(inclinacao + 10) * $.staticFriction).toFixed(2));

            if (f_peso_x > 0.16) {
                $('#atrito').css('width', $.boxWeight * $.coseno(inclinacao + 10) * $.staticFriction);
                $('#atrito div').text('Fac: ' + f_atrito + ' N');
            } else {
                $('#atrito').css('width', $.boxWeight * $.seno(inclinacao + 10));
                $('#atrito div').text('Fae: ' + f_peso_x + ' N');
            }


            $('#normal').css('height', $.boxWeight * $.coseno(inclinacao + 10));
            $('#normal div').text('N: ' + parseFloat(($.weightForce * $.coseno(inclinacao + 10)).toFixed(2)) + ' N');

            $('#base_medidas').css({
                'width': parseInt($.coseno(inclinacao + 10) * 1034) + 'px'
            });
            $('#base_medidas div').text(parseFloat($.coseno(inclinacao + 10) * 60).toFixed(2) + 'cm');
            $('#altura_medidas').css({
                'height': parseInt($.seno(inclinacao + 10) * 1034) + 'px',
                'left': 10 + parseInt($.coseno(inclinacao + 10) * 1034) + 'px'
            });
            $('#altura_medidas div').text(parseFloat($.seno(inclinacao + 10) * 60).toFixed(2) + 'cm');
            $(elem.selector).data('current-deg', now);
        }
    });
}
