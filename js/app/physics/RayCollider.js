define([
    "lib/p2",
    "physics/world"
], function(
    p2,
    world
) {

    function RayCollider(options) {
        this.dir = options.dir;
        this.distance = options.distance || 0.5; // "warning" distance
        this.onContact = options.callback || function() {};

        var from = p2.vec2.create();
        var to = p2.vec2.create();
        p2.vec2.add(to, from, this.dir);

        this.lastCollision = null;
        this.ray = new p2.Ray({
            mode: p2.Ray.CLOSEST,
            from: from,
            to: to
        });
        this.rayResult = new p2.RaycastResult();
    }

    RayCollider.prototype.check = function(x, y) {
        this.setPos(x, y);

        this.rayResult = new p2.RaycastResult(); // make sure it is empty
        world.raycast(this.rayResult, this.ray);

        var pos = p2.vec2.create();
        p2.vec2.copy(pos, this.ray.from);
        if (this.rayResult.body) {
            var distance = this.rayResult.getHitDistance(this.ray);
            var hit = p2.vec2.create();
            this.rayResult.getHitPoint(hit, this.ray);
            this.lastCollision = {
                pos: pos,
                hit: hit,
                distance: distance
            };
            if (distance < this.distance) {
                this.onContact(hit);
                return true;
            }
        } else {
            if (this.lastCollision) {
                if (this.lastCollision.distance < p2.vec2.distance(this.lastCollision.pos, pos)) {
                    this.onContact(this.lastCollision.hit);
                    this.lastCollision = null;
                    return true;
                }
            }
            this.lastCollision = null;
        }
        return false;
    };

    RayCollider.prototype.setPos = function(x, y) {
        p2.vec2.set(this.ray.from, x, y);
        p2.vec2.add(this.ray.to, this.ray.from, this.dir);
    };

    RayCollider.prototype.reset = function() {
        this.lastCollision = null;
    };

    return RayCollider;

});