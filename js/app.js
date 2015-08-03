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
    showLoader: function () {
        $.blockUI({
            message: $('#ajax-loader'),
            css: {
                top: ($(window).height() - 96) / 2 + 'px',
                left: ($(window).width() - 96) / 2 + 'px',
                width: '96px'
            }
        });
    },
    hideLoader: function () {
        $.unblockUI();
    },
    lpad: function (n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
});

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

var _ = {
    g: 9.8,
    massa_caixa: undefined,
    staticFriction: undefined,
    dinamicFriction: undefined,
    peso: function () {
        return parseFloat((_.massa_caixa * _.g).toFixed(2), null);
    },
    peso_x: function (deg) {
        return _.peso() * $.seno(deg);
    },
    peso_y: function (deg) {
        return _.peso() * $.coseno(deg);
    },
    peso_modulo: function () {
        return _.peso() * 200;
    },
    peso_x_modulo: function (deg) {
        return _.peso_x(deg) * 200;
    },
    peso_y_modulo: function (deg) {
        return _.peso_y(deg) * 200;
    }
}

var DinamicaIno = function () {

    var system = {

        init: function () {
            /*$('#caixa').on('detected', function (e, data) {
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

            

           */

            this.fireEvents();
            $('#massa-input').val(0.062);
            $('#massa-input').trigger('change');

            $('#input_medidas').trigger('change');
            $('#input_forcas').trigger('change');
            $("#slider-1").trigger('slidestop');
        },
        fireEvents: function () {
            $('#massa-input').change(function () {
                _.massa_caixa = parseFloat($(this).val(), null);
                $('#input_inclinacao').trigger('change');
            });

            $('#input_medidas').change(function () {
                system.mostrarMedidas(!$(this).is(':checked'));
            });

            $('#input_forcas').change(function () {
                system.mostrarDiagrama(!$(this).is(':checked'));
            });

            $("#slider-1").on('slidestop', function (event) {
                system.mover($("#slider-1").val());
            });

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
        atritoEstatico: function (elem) {
            $.showLoader();
            $("#slider-1").val(10);
            $("#slider-1").trigger('slidestop');
            $.get('/static').done(function (data) {
                var result = eval('[' + data + ']')[0];
                console.log(result);
                var hDeg = parseInt(result['static-friction'], null);
                var staticFrictionDeg = parseInt((hDeg * 22 / 180) + 10, null);
                _.staticFriction = parseFloat($.tangente(staticFrictionDeg)).toFixed(2);
                $('#friction-static-span').text(_.staticFriction);
                $("#slider-1").val(staticFrictionDeg);
                $("#slider-1").trigger('slidestop');
                $.hideLoader();
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

            var angulo = inclinacao + 10;

            $('#peso').css('height', _.peso_modulo() + 'px');
            $('#peso div').text('P: ' + _.peso() + ' N');

            $('#peso_x').css('width', _.peso_x_modulo(angulo) + 'px');
            $('#peso_x div').text('Px: ' + _.peso_x(angulo).toFixed(2) + ' N');

            $('#peso_y').css('height', _.peso_y_modulo(angulo) + 'px');
            $('#peso_y div').text('Px: ' + _.peso_y(angulo).toFixed(2) + ' N');

            $('#normal').css('height', _.peso_y_modulo(angulo) + 'px');
            $('#normal div').text('N: ' + _.peso_y(angulo).toFixed(2) + ' N');

            _.staticFriction = _.staticFriction || 0;
            _.dinamicFriction = _.dinamicFriction || 0;

            var forcaAtritoEstatico = _.peso_y(angulo) * _.staticFriction;
            var forcaAtritoCinetico = _.peso_y(angulo) * _.dinamicFriction;
            if (_.peso_x(angulo).toFixed(2) <= forcaAtritoEstatico.toFixed(2)) {
                $('#atrito').css('width', _.peso_x_modulo(angulo) + 'px');
                $('#atrito div').text('Fae: ' + _.peso_x(angulo).toFixed(2) + ' N');
            } else {
                $('#atrito').css('width', forcaAtritoCinetico + 'px');
                $('#atrito div').text('Fae: ' + (forcaAtritoCinetico * 200) + ' N');
            }

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
