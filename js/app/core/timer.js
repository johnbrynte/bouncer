define(function() {

    var self = {
        start: start,
        stop: stop,
        onDraw: onDraw,
        onStep: onStep
    };

    var timestep = 1 / 120;
    var accumulated = 0;
    var prevtime = 0;
    var running = false;
    var stepcallbacks = [];
    var drawcallbacks = [];

    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(f) {
        window.setTimeout(f, 1 / 30);
    };

    return self;

    /////////////

    function start() {
        if (!running) {
            running = true;
            accumulated = 0;
            prevtime = Date.now();
            innerLoop();
        }
    }

    function stop() {
        running = false;
    }

    function onDraw(f) {
        drawcallbacks.push(f);
    }

    function onStep(f) {
        stepcallbacks.push(f);
    }

    function innerLoop() {
        var time = Date.now();
        var t = time - prevtime;
        var d = 0;
        if (t > 0)
            d = t / 1000;
        if (d > 1 / 4)
            d = 1 / 4;
        accumulated += d;
        while (accumulated >= timestep) {
            accumulated -= timestep;

            // step
            for (var i = 0; i < stepcallbacks.length; i++)
                stepcallbacks[i](timestep);
        }
        prevtime = time;

        // draw
        for (var i = 0; i < drawcallbacks.length; i++)
            drawcallbacks[i]();

        if (running)
            window.requestAnimationFrame(innerLoop);
    }
});