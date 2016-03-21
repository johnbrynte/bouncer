define([
    "core/timer",
    "core/renderer",
    "core/assets"
], function(
    timer,
    renderer,
    assets
) {

    function ViewBox(x, y, w, h) {
        this.vbx = x;
        this.vby = y;
        this.x = 0;
        this.y = 0;
        this.w = w;
        this.h = h;

        //this.graphic = assets.createRectangle(w, h, 0xff0000);
        //this.graphic.material.opacity = 0.2;
    }

    ViewBox.prototype.setPos = function(x, y) {
        this.x = x;
        this.y = y;
    };

    ViewBox.prototype.update = function(x, y, w, h) {
        var dx = x - this.x;
        var dy = y - this.y;
        var _x = this.x;
        var _y = this.y;
        if (Math.abs(dx) > this.w / 2 - w / 2) {
            if (dx > 0) {
                _x = x + w / 2 - this.w / 2;
            } else {
                _x = x - w / 2 + this.w / 2;
            }
        }
        if (Math.abs(dy) > this.h / 2 - h / 2) {
            if (dy > 0) {
                _y = y + h / 2 - this.h / 2;
            } else {
                _y = y - h / 2 + this.h / 2;
            }
        }
        var speed = 15 * timer.fixedDeltaTime;
        this.x = this.x + (_x - this.x) * speed;
        this.y = this.y + (_y - this.y) * speed;
        renderer.setCameraPos(this.x - this.vbx, this.y - this.vby);
        //this.graphic.position.set(this.x, this.y, 2);
    };

    return ViewBox;

});