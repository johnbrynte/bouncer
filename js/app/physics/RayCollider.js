define([
    "lib/p2",
    "physics/world",
    "core/Debug",
    "entities/Line"
], function(
    p2,
    world,
    Debug,
    Line
) {

    function RayCollider(options) {
        this.dir = options.dir;
        this.distance = options.distance || 0.5; // "warning" distance
        this.onContact = options.callback || function() {};
        this.debug = options.debug ? new Debug() : null;
        this.points = options.points || [0, 0];
        this.norm = p2.vec2.create();

        p2.vec2.normalize(this.norm, this.dir);
        p2.vec2.scale(this.dir, this.norm, 10);

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
        this.collisions = new Array(this.points.length / 2);

        var lines = [];
        /*for (var i = 0; i < this.points.length / 2; i++) {
            lines.push(new Line(this.dir[0], this.dir[1]));
        }*/
        this.lines = lines;

        console.log(this.dir, this.distance);
    }

    RayCollider.prototype.check = function(x, y) {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].setPos(x + this.points[i * 2], y + this.points[i * 2 + 1]);
            this.lines[i].setLength(10);
        }
        for (var i = 0; i < this.collisions.length; i++) {
            this.collisions[i] = null;
        }
        for (var i = 0; i < this.points.length; i += 2) {
            this.setPos(x + this.points[i], y + this.points[i + 1]);

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
                    body: this.rayResult.body,
                    distance: distance
                };
                this.collisions[i / 2 | 0] = this.lastCollision;
                if (this.lines.length) {
                    this.lines[i / 2 | 0].setLength(distance);
                }
                if (distance < this.distance) {
                    if (this.debug) {
                        this.debug.log(distance, Math.floor(hit[0] * 10) / 10, Math.floor(hit[1] * 10) / 10);
                    }
                    this.onContact(hit, this.rayResult.body);
                    return true;
                } else {
                    if (this.debug) {
                        this.debug.log("");
                    }
                }
            } else {
                if (this.debug) {
                    this.debug.log("");
                }
                if (this.lastCollision) {
                    var dist = p2.vec2.create();
                    p2.vec2.sub(dist, pos, this.lastCollision.pos);
                    var dot = p2.vec2.dot(dist, this.norm);
                    if (this.lastCollision.distance < dot) {
                        this.onContact(this.lastCollision.hit, this.lastCollision.body);
                        this.lastCollision = null;
                        return true;
                    }
                    if (this.lines.length) {
                        this.lines[i / 2 | 0].setLength(this.lastCollision.distance);
                    }
                }
                this.lastCollision = null;
                this.collisions[i / 2 | 0] = null;
            }
        }
        return false;
    };

    RayCollider.prototype.getCollision = function(index) {
        return index >= 0 && index < this.collisions.length ? this.collisions[index] : null;
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