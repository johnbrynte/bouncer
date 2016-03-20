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
            case "space":
                bouncer.swing();
                break;
            case "action4":
                bouncer.setPos(0, 10);
                break;
            case "action2":
            case "up":
                bouncer.jump();
                break;
        }
    });

    input.onKeyDown(function(key) {
        switch (key) {
            case "left":
                bouncer.move(-1, 0);
                break;
            case "up":
                break;
            case "right":
                bouncer.move(1, 0);
                break;
            case "down":
                break;
        }
    });

    input.onKeyEnd(function(key) {
        switch (key) {
            case "action1":
            case "space":
                bouncer.swingEnd();
                break;
            case "action2":
            case "space":
                bouncer.jumpEnd();
                break;
        }
    });

    var delta = 0;
    var block2;

    timer.onDraw(function() {
        renderer.render();
    });
    timer.onStep(function(d) {
        input.update();

        delta += d;
        //block2.move(2 * Math.sin(delta * 2 * Math.PI / 2), 3 + 1 * Math.sin((delta * 2 + 2.5) * Math.PI / 2), d);

        world.update(d);

        bouncer.update(d);
        if (bouncer.pos.y < -8) {
            bouncer.setPos(-12, 10);
        }

        renderer.update(d);

    });

    assets.load({
        "img/bouncer.png": "img"
    }, init);

    function init() {
        bouncer = new Bouncer();
        bouncer.setPos(-12, 10);

        var block1 = new Block(-10, -5, 5, 10, 0xddddddd);
        //block2 = new Block(0, 3, 5, 2, 0xddddddd);
        //block2.rotate(0.3);
        var block3 = new Block(8, -4, 5, 14, 0xddddddd);
        var block4 = new Block(-1, -5, 23, 4, 0xaaaaaa);

        timer.start();
    }

});