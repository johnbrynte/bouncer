define([
    "./constants",
    "lib/p2"
], function(
    constants,
    p2
) {

    var self = {
        add: add,
        raycast: raycast,
        update: update,

        materials: null
    };

    var world;

    init();

    return self;

    //////////////

    function init() {
        world = new p2.World({
            gravity: [0, constants.gravity]
        });

        world.on("beginContact", function(event) {
            if (typeof event.bodyA.beginContact == "function")
                event.bodyA.beginContact(event.bodyB);
            if (typeof event.bodyB.beginContact == "function")
                event.bodyB.beginContact(event.bodyA);
        });

        world.on("endContact", function(event) {
            if (typeof event.bodyA.endContact == "function")
                event.bodyA.endContact(event.bodyB);
            if (typeof event.bodyB.endContact == "function")
                event.bodyB.endContact(event.bodyA);
        });

        var materials = {
            basic: new p2.Material()
        };
        self.materials = materials;

        var basicContactMaterial = new p2.ContactMaterial(materials.basic, materials.basic, {
            friction: 0.1
        });
        world.addContactMaterial(basicContactMaterial);
    }

    function add(body) {
        world.addBody(body);
    }

    function raycast(result, ray) {
        world.raycast(result, ray);
    }

    function update(d) {
        world.step(d);
    }

});