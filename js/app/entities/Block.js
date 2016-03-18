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

    Block.prototype.setPos = function(x, y) {
        this.physic.position[0] = x;
        this.physic.position[1] = y;
        this.graphic.position.set(x, y, 0);
    };

    Block.prototype.rotate = function(r) {
        this.physic.angle = r;
        this.graphic.rotation.z = r;
    }

    return Block;

});