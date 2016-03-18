define([
    "core/renderer",
    "core/input",
    "core/timer",
    "core/assets",
    "physics/world",

    "entities/Bouncer",
    "entities/Block"
], function(
    renderer,
    input,
    timer,
    assets,
    world,

    Bouncer,
    Block
) {

    var bouncer;

    input.onKeyStart(function(key) {
        switch (key) {
            case "action1":
            case "mod1":
                bouncer.setRunning(true);
                break;
            case "action2":
            case "space":
                bouncer.jump();
                break;
            case "action4":
                bouncer.setPos(0, 10);
                break;
        }
    });

    input.onKeyDown(function(key) {
        switch (key) {
            case "left":
                bouncer.move(-1, 0);
                break;
            case "up":
                bouncer.move(0, 1);
                break;
            case "right":
                bouncer.move(1, 0);
                break;
            case "down":
                bouncer.move(0, -1);
                break;
        }
    });

    input.onKeyEnd(function(key) {
        switch (key) {
            case "action1":
            case "mod1":
                bouncer.setRunning(false);
                break;
            case "action2":
            case "space":
                bouncer.jumpEnd();
                break;
        }
    });

    timer.onDraw(function() {
        renderer.render();
    });
    timer.onStep(function(d) {
        input.update();

        renderer.update(d);
        //world.update(d);

        bouncer.update(d);

        if (bouncer.pos.y < -8) {
            bouncer.setPos(0, 10);
        }
    });

    assets.load({
        "img/bouncer.png": "img"
    }, init);

    function init() {
        bouncer = new Bouncer();
        bouncer.setPos(0, 10);
        window.b = bouncer;

        var block1 = new Block(-10, -5, 5, 10, 0xddddddd);
        var block2 = new Block(0, 3, 5, 2, 0xddddddd);
        //block2.rotate(0.3);
        var block3 = new Block(8, -4, 5, 14, 0xddddddd);
        var block4 = new Block(-1, -5, 23, 4, 0xaaaaaa);

        timer.start();
    }

});