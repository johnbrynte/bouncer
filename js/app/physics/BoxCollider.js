define([
    "lib/p2",
    "physics/world"
], function(
    p2,
    world
) {

    function BoxCollider(width, height, mass) {
        p2.Body.call(this, {
            type: isNaN(mass) ? p2.Body.KINEMATIC : p2.Body.DYNAMIC,
            mass: isNaN(mass) ? 0 : mass,
            position: [0, 0]
        });

        var shape = new p2.Box({
            width: width,
            height: height
        });
        shape.material = world.materials.basic;
        this.addShape(shape);

        this.graphic = null;

        this.beginContactListeners = [];
        this.endContactListeners = [];

        world.add(this);
    }

    BoxCollider.prototype = new p2.Body();
    BoxCollider.prototype.constructor = BoxCollider;

    BoxCollider.prototype.integrate = function(dt, timeSinceLastCalled, maxSubSteps) {
        p2.Body.prototype.integrate.call(this, dt, timeSinceLastCalled, maxSubSteps);

        if (this.graphic) {
            this.graphic.position.set(this.position[0], this.position[1], 0);
        }
    };

    BoxCollider.prototype.setGraphic = function(graphic) {
        this.graphic = graphic;
    };

    BoxCollider.prototype.setPos = function(x, y) {
        this.position[0] = x;
        this.position[1] = y;
        this.velocity[0] = 0;
        this.velocity[1] = 0;
    };

    BoxCollider.prototype.onBeginContact = function(f) {
        this.beginContactListeners.push(f);
    };

    BoxCollider.prototype.onEndContact = function(f) {
        this.endContactListeners.push(f);
    };

    BoxCollider.prototype.beginContact = function(body) {
        for (var i = 0; i < this.beginContactListeners.length; i++)
            this.beginContactListeners[i](body);
    };

    BoxCollider.prototype.endContact = function(body) {
        for (var i = 0; i < this.endContactListeners.length; i++)
            this.endContactListeners[i](body);
    };

    return BoxCollider;

});