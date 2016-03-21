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
            case "up":
                bouncer.jumpEnd();
                break;
        }
    });

    var delta = 0;
    var block2, block5;

    timer.onDraw(function() {
        renderer.render();
    });
    timer.onStep(function(d) {
        input.update();

        delta += d;
        block2.move(block2.x, 1 + 1.5 * Math.sin(delta * 2 * Math.PI / 4), d);
        block5.move(34 + 3 * Math.sin(delta * 2 * Math.PI / 5), block5.y, d);

        world.update(d);

        bouncer.update(d);
        if (bouncer.pos.y < -15) {
            bouncer.setPos(-12, 2);
        }

        renderer.update(d);

    });

    assets.load({
        "img/bouncer.png": "img",
        "img/bouncer_vector.png": "img",
        "img/bouncer_vector_lines.png": "img"
    }, init);

    function init() {
        bouncer = new Bouncer();
        bouncer.setPos(-12, 2);

        var block1 = new Block(-10, -5, 5, 10, 0xddddddd);
        block2 = new Block(15, 3, 5, 1, 0xddddddd);
        //block2.rotate(0.3);
        var block3 = new Block(8, -4, 5, 14, 0xddddddd);
        var block4 = new Block(6, -5, 43, 4, 0xaaaaaa);
        block5 = new Block(25, -2, 5, 1, 0xdddddd);
        var block6 = new Block(42, -5, 2, 4, 0xaaaaaa);
        var block7 = new Block(48, -5, 1, 4, 0xaaaaaa);
        var block8 = new Block(64, -5, 3, 4, 0xaaaaaa);
        var block9 = new Block(87, -5, 7, 4, 0xaaaaaa);

        timer.start();
    }

});