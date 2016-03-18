define([
    "lib/three",
    "lib/p2",
    "core/Debug",
    "core/renderer",
    "core/assets",
    "physics/constants",
    "physics/world",
    "physics/RayCollider",
    "entities/Sprite"
], function(
    THREE,
    p2,
    Debug,
    renderer,
    assets,
    constants,
    world,
    RayCollider,
    Sprite
) {

    var decH = 6;
    var decAirH = 2;
    var decRunningH = 6;
    var accH = 80;
    var accAirH = 30;
    var accRunningH = 140;
    var decV = 4;
    var maxHSpeed = 50;
    var skidTime = 0.3;
    var wallSlideAcc = 80;
    var wallStickSpeedLimit = 5;

    var jumpSpeed = 36;
    var accJump = 120;
    var minJumpTime = 0.1;
    var maxJumpTime = 0.3;

    var debug = new Debug();

    function Bouncer() {
        this.pos = {
            x: 0,
            y: 0,
            z: 1
        };
        this.speed = {
            x: 0,
            y: 0
        };
        this.acc = {
            x: 0,
            y: 0
        };
        this.jumpDelta = 0;
        this.jumpActive = false;
        this.running = false;
        this.jumping = false;
        this.onGround = false;
        this.moving = false;

        this.wallSliding = false;
        this.wallDirection = 0;

        this.skidding = false;
        this.skidDirection = 0;
        this.skidTimer = skidTime;

        //this.physic = new BoxCollider(1, 1);
        //this.graphic = assets.createRectangle(1, 1, 0xE3ECEC);
        //this.graphic = assets.createSprite(1, 1, assets.files["img/bouncer.png"]);
        this.graphic = assets.createSprite(assets.files["img/bouncer.png"], 1, 1, 8, 8);
        this.skidParticles = assets.createParticleEffect(0, 0);
        this.emitter = this.skidParticles.emitters[0];
        this.emitter.disable();

        this.animations = {
            run: {
                duration: 1,
                timer: 0,
                scale: 1,
                cycle: [0, 2, 3, 2]
            }
        };
        this.animation = "run";

        /*this.physic.onBeginContact(this.beginContact.bind(this));
        this.physic.onEndContact(function(body) {
            console.log("end", body);
        });*/

        this.lastCollision = null;
        this.leftCol = null;
        this.rightCol = null;

        this.topCol = new RayCollider({
            dir: [0, 0.5],
            distance: 0.5,
            callback: topCollisionCallback
        });
        this.groundCol = new RayCollider({
            dir: [0, -0.5],
            distance: 0.5,
            callback: groundCollisionCallback
        });
        this.rightCol = new RayCollider({
            dir: [0.25, 0],
            distance: 0.26,
            callback: rightCollisionCallback
        });
        this.leftCol = new RayCollider({
            dir: [-0.25, 0],
            distance: 0.26,
            callback: leftCollisionCallback
        });

        var self = this;

        function topCollisionCallback(hit) {
            if (self.speed.y > 0) {
                self.pos.y = -0.5 + hit[1];
                self.speed.y = 0;
            }
        }

        function groundCollisionCallback(hit) {
            if (self.speed.y < 0) {
                self.pos.y = 0.5 + hit[1];
                self.speed.y = 0;
                self.onGround = true;
                if (self.wallSliding) {
                    self.emitter.disable();
                    self.wallSliding = false;
                }
            }
        }

        function rightCollisionCallback(hit) {
            if (self.speed.x > 0) {
                self.pos.x = -0.25 + hit[0];

                if (!self.onGround && !self.wallSliding && self.speed.x > wallStickSpeedLimit) {
                    self.wallSliding = true;
                    self.wallDirection = 1;
                    self.emitter.enable();
                }
            } else {
                if (self.wallSliding) {
                    self.wallSliding = false;
                    self.emitter.disable();
                }
            }
        }

        function leftCollisionCallback(hit) {
            if (self.speed.x < 0) {
                self.pos.x = 0.25 + hit[0];

                if (!self.onGround && !self.wallSliding && -self.speed.x > wallStickSpeedLimit) {
                    self.wallSliding = true;
                    self.wallDirection = -1;
                    self.emitter.enable();
                }
            } else {
                if (self.wallSliding) {
                    self.wallSliding = false;
                    self.emitter.disable();
                }
            }
        }
    }

    Bouncer.prototype.setPos = function(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.speed.x = 0;
        this.speed.y = 0;
        this.acc.x = 0;
        this.acc.y = 0;

        /*this.physic.position[0] = x;
        this.physic.position[1] = y;*/
    };

    Bouncer.prototype.move = function(x, y) {
        this.moving = true;

        if (x < 0) {
            this.graphic.flipHorizontal(true);
        } else {
            this.graphic.flipHorizontal(false);
        }

        var acc = accH * (0.5 + Math.min(Math.pow(this.speed.x / 10, 2), 0.5));
        if (!this.onGround) {
            acc = accAirH;
        } else if (this.running) {
            acc = accRunningH;
        }
        //var force = p2.vec2.create(acc * x, acc * y);
        //this.physic.applyForce([acc * x, acc * y]);
        this.applyForce(acc * x, acc * y);
    };

    Bouncer.prototype.applyForce = function(x, y) {
        this.acc.x += x;
        this.acc.y += y;
    };

    Bouncer.prototype.beginContact = function(body) {
        console.log("begin", body);
        var aabb1 = this.physic.aabb;
        var aabb2 = body.aabb;
        console.log(aabb1.lowerBound, aabb1.upperBound);
        console.log(aabb2.lowerBound, aabb2.upperBound);

        var dy = aabb1.lowerBound[1] - aabb2.upperBound[1];
        var pos = this.physic.position;
        this.physic.setPos(pos[0], pos[1] + dy);
    };

    Bouncer.prototype.update = function(d) {
        this.applyForce(0, constants.gravity);

        if (this.jumping) {
            this.jumpDelta += d;
            if (this.jumpActive) {
                if (this.jumpDelta > maxJumpTime) {
                    this.jumping = false;
                } else {
                    this.applyForce(0, accJump);
                }
            } else {
                if (this.jumpDelta > minJumpTime) {
                    this.jumping = false;
                    this.jumpActive = false;
                } else {
                    this.applyForce(0, accJump);
                }
            }
        }

        var decX = decH;
        if (!this.onGround) {
            decX = decAirH;
        } else if (this.running) {
            decX = decRunningH;
        }

        if (!this.skidding) {
            if (this.onGround && this.acc.x != 0 && Math.abs(this.speed.x) > 9 && Math.sign(this.acc.x) != Math.sign(this.speed.x)) {
                //debug.log("skidding", this.acc.x, this.speed.x);
                this.skidding = true;
                this.skidDirection = Math.sign(this.speed.x);
                //this.graphic.material.color.setHex(0xE3aaaa);
                //this.graphic.material.needsUpdate = true;
                this.emitter.enable();
            }
        } else {
            if (!this.moving || !this.onGround || Math.sign(this.acc.x) == this.skidDirection || Math.abs(this.speed.x) > 11) {
                this.skidding = false;
                //debug.log("");
                //this.graphic.material.color.setHex(0xE3ECEC);
                //this.graphic.material.needsUpdate = true;
                //this.graphic.rotation.z = 0;
                this.emitter.disable();
            }
        }
        if (this.skidding) {
            decX = -decX / 2;
            this.acc.x /= 1.5;
        }

        var decY = decV;
        if (this.wallSliding) {
            decY *= 4;
            //this.applyForce(0, wallSlideAcc);
        }

        this.speed.y += this.acc.y * d - this.speed.y * decY * d;
        this.pos.y += this.speed.y * d;

        // collision detection
        this.topCol.check(this.pos.x - 0.2, this.pos.y);
        this.topCol.check(this.pos.x + 0.2, this.pos.y);
        this.onGround = false;
        if (!this.jumping) {
            this.groundCol.check(this.pos.x - 0.2, this.pos.y);
            this.groundCol.check(this.pos.x + 0.2, this.pos.y);
        }

        this.speed.x += this.acc.x * d - this.speed.x * decX * d;
        this.pos.x += this.speed.x * d;

        var rightCol = this.rightCol.check(this.pos.x, this.pos.y + 0.45);
        var leftCol = this.leftCol.check(this.pos.x, this.pos.y + 0.45);
        rightCol = rightCol || this.rightCol.check(this.pos.x, this.pos.y - 0.45);
        leftCol = leftCol || this.leftCol.check(this.pos.x, this.pos.y - 0.45);

        if (this.wallSliding && !rightCol && !leftCol) {
            this.wallSliding = false;
            this.speed.x /= 8;
            this.emitter.disable();
        }

        if (this.jumping && this.speed.y < 0) {
            this.jumping = false;
        }

        if (this.skidding) {
            this.emitter.position.value = this.emitter.position.value.set(this.pos.x + this.skidDirection * 0.5, this.pos.y - 0.4, 0);
        }
        if (this.wallSliding) {
            this.emitter.position.value = this.emitter.position.value.set(this.pos.x + this.wallDirection * 0.5, this.pos.y - 0.4, 0);
        }

        if (this.skidTimer < skidTime) {
            this.skidTimer += d;
            if (this.skidTimer > skidTime) {
                this.skidTimer = skidTime;
            }
            this.graphic.rotation.z = this.skidDirection * 2 * Math.PI * this.skidTimer / skidTime;
        }

        var animation = this.animations[this.animation];
        animation.scale = Math.abs(this.speed.x / 4);
        animation.timer += d * animation.scale;
        if (animation.timer > animation.duration) {
            animation.timer -= animation.duration;
        }
        this.graphic.setTile(animation.cycle[Math.floor(animation.cycle.length * animation.timer / animation.duration)]);

        if (this.wallSliding) {
            this.graphic.setTile(1);
        }

        // reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;
        // reset movement
        this.moving = false;

        this.graphic.position.set(this.pos.x, this.pos.y, this.pos.z);
    };

    Bouncer.prototype.setRunning = function(bool) {
        this.running = bool;
    };

    Bouncer.prototype.jump = function() {
        if (this.onGround || this.wallSliding) {
            this.onGround = false;
            this.jumping = true;
            this.jumpActive = true;
            this.jumpDelta = 0;

            var amount = 0.75 + 0.25 * Math.min(Math.abs(this.speed.x) / 40, 1);
            if (this.skidding) {
                this.speed.x = -this.skidDirection * 10;
                amount *= 1.4;
                this.skidTimer = 0;
            }
            if (this.wallSliding) {
                this.speed.x = -this.wallDirection * 10;
                amount = 0.75;
                debug.log("x", this.speed.x);
            }
            this.speed.y = jumpSpeed * amount;

            this.groundCol.reset();
        }
    };

    Bouncer.prototype.jumpEnd = function() {
        if (this.jumpActive) {
            this.jumpActive = false;
        }
    };

    return Bouncer;

});