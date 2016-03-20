define([
    "core/assets",
    "physics/BoxCollider"
], function(
    assets,
    BoxCollider
) {

    function Block(x, y, width, height, color) {
        this.width = width;
        this.height = height;

        this.physic = new BoxCollider(width, height);
        this.graphic = assets.createRectangle(width, height, color || 0xffffff);

        this.setPos(x, y);
    }

    Block.prototype.move = function(x, y, d) {
        var dx = x - this.x;
        var dy = y - this.y;
        this.x = x;
        this.y = y;

        var vx = this.physic.velocity[0];
        var vy = this.physic.velocity[1];

        this.physic.position[0] = x;
        this.physic.position[1] = y;
        // this.physic.velocity[0] = dx / d;
        // this.physic.velocity[1] = dy / d;

        this.physic.delta = [dx, dy];

        //this.physic.acc = [(dx / d - vx) / d, (dy / d - vy) / d];

        //this.physic.applyForce([10, 0]);
        this.graphic.position.set(x, y, 0);

    };

    Block.prototype.setPos = function(x, y) {
        this.x = x;
        this.y = y;
        this.physic.position[0] = x;
        this.physic.position[1] = y;
        this.graphic.position.set(x, y, 0);
    };

    Block.prototype.rotate = function(r) {
        this.physic.angle = r;
        this.graphic.rotation.z = r;
    };

    return Block;

});