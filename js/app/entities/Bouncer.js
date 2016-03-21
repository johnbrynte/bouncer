define([
    "lib/three",
    "lib/p2",
    "core/timer",
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
    timer,
    Debug,
    renderer,
    assets,
    constants,
    world,
    RayCollider,
    Sprite
) {

    var idleSpeedLimit = 0.5;
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
    var wallMinFallSpeed = 6;
    var minAnimationSpeed = 4;

    var jumpSpeed = 28;
    var accJump = 100;
    var minJumpTime = 0.0;
    var maxJumpTime = 0.3;

    var swingTime = 1.2;
    var swingMinTime = 0.45;
    var swingMinJumpTime = 0.05;
    var swingEndTime = 0.1;
    var swingLiftAcc = 120; // equal to gravity

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
        // collision
        this.onGround = false;
        this.leftInContact = false;
        this.rightInContact = false;
        // motion
        this.idle = true;
        this.running = false;
        this.moving = false;
        // jumping
        this.jumping = false;
        this.jumpDelta = 0;
        this.jumpActive = false;
        // wall sliding
        this.wallJumping = false;
        this.wallSliding = false;
        this.wallDirection = 0;
        // ground skidding
        this.skidding = false;
        this.skidDirection = 0;
        this.skidTimer = skidTime;

        this.swung = false;
        this.swinging = false;
        this.swingActive = false;
        this.swingDirection = 0;
        this.swingTimer = swingTime;
        this.swingEndTimer = swingEndTime;
        this.swingingAnimation = [4, 5, 6, 7, 4, 5, 6];

        this.flipped = false;

        // used to stick to moving platforms
        this.activeGround = null;

        //this.physic = new BoxCollider(1, 1);
        //this.graphic = assets.createRectangle(1, 1, 0xE3ECEC);
        //this.graphic = assets.createSprite(1, 1, assets.files["img/bouncer.png"]);
        this.graphic = assets.createSprite(assets.files["img/bouncer_vector_lines.png"], 1.7, 1.7, 64, 64);
        this.skidParticles = assets.createParticleEffect(0, 0);
        this.emitter = this.skidParticles.emitters[0];
        this.emitter.disable();

        this.graphicHammer = assets.createSprite(assets.files["img/bouncer_vector_lines.png"], 1.4, 1.4, 64, 64);
        this.graphicHammer.setTile(3);
        this.graphic.add(this.graphicHammer);
        this.graphicHammer.visible = false;

        this.animations = {
            idle: {
                duration: 0.6,
                timer: 0,
                scale: 1,
                cycle: [12, 13, 14, 13]
            },
            run: {
                duration: 0.8,
                timer: 0,
                scale: 1,
                cycle: [8, 9, 10]
            }
        };
        this.animation = "idle";

        /*this.physic.onBeginContact(this.beginContact.bind(this));
        this.physic.onEndContact(function(body) {
            console.log("end", body);
        });*/

        this.lastCollision = null;
        this.leftCol = null;
        this.rightCol = null;

        this.spriteOffset = {
            x: 0.05,
            y: 0.15
        };
        var bbox = {
            width: 5 / 8,
            height: 1
        };
        this.bbox = bbox;
        var offset = 0.05;

        this.topCol = new RayCollider({
            points: [-bbox.width / 2 + offset, 0, bbox.width / 2 - offset, 0],
            dir: [0, 1],
            distance: bbox.height / 2,
            callback: topCollisionCallback
        });
        this.groundCol = new RayCollider({
            points: [-bbox.width / 2 + offset, 0, bbox.width / 2 - offset, 0],
            dir: [0, -1],
            distance: bbox.height / 2,
            callback: groundCollisionCallback
        });
        this.rightCol = new RayCollider({
            points: [0, -bbox.height / 2 + offset, 0, bbox.height / 2 - offset],
            dir: [1, 0],
            distance: bbox.width / 2,
            callback: rightCollisionCallback
        });
        this.leftCol = new RayCollider({
            points: [0, -bbox.height / 2 + offset, 0, bbox.height / 2 - offset],
            dir: [-1, 0],
            distance: bbox.width / 2,
            callback: leftCollisionCallback
        });

        var self = this;

        function topCollisionCallback(hit) {
            if (self.speed.y > 0) {
                self.pos.y = -0.5 + hit[1];
                self.speed.y = 0;
            }
        }

        function groundCollisionCallback(hit, body) {
            if (true || self.speed.y < 0) {
                self.pos.y = 0.5 + hit[1];
                self.speed.y = 0;
                self.onGround = true;
                self.activeGround = {
                    hit: hit,
                    body: body
                };
                if (self.wallSliding) {
                    self.emitter.disable();
                    self.wallSliding = false;
                }
                if (self.swung) {
                    self.swung = false;
                }
            }
        }

        function rightCollisionCallback(hit) {
            //if (true || self.speed.x >= 0) {
            self.pos.x = -self.bbox.width / 2 + hit[0];

            if (!self.wallSliding && !self.onGround && self.speed.y < -wallMinFallSpeed && self.speed.x > wallStickSpeedLimit) {
                self.wallSliding = true;
                self.wallDirection = 1;
                self.emitter.enable();
            }
            // } else {
            //     if (self.wallSliding) {
            //         self.wallSliding = false;
            //         self.emitter.disable();
            //     }
            // }
        }

        function leftCollisionCallback(hit) {
            //if (true || self.speed.x <= 0) {
            self.pos.x = self.bbox.width / 2 + hit[0];

            if (!self.wallSliding && !self.onGround && self.speed.y < -wallMinFallSpeed && -self.speed.x > wallStickSpeedLimit) {
                self.wallSliding = true;
                self.wallDirection = -1;
                self.emitter.enable();
            }
            // } else {
            //     if (self.wallSliding) {
            //         self.wallSliding = false;
            //         self.emitter.disable();
            //     }
            // }
        }
    }

    Bouncer.prototype.setPos = function(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.speed.x = 0;
        this.speed.y = 0;
        this.acc.x = 0;
        this.acc.y = 0;

        this.topCol.reset();
        this.groundCol.reset();
        this.leftCol.reset();
        this.rightCol.reset();
        /*this.physic.position[0] = x;
        this.physic.position[1] = y;*/
    };

    Bouncer.prototype.move = function(x, y) {
        this.moving = true;

        if (!this.swinging) {
            if (x < 0) {
                this.graphic.flipHorizontal(true);
                this.flipped = true;
            } else {
                this.graphic.flipHorizontal(false);
                this.flipped = false;
            }
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
            if (this.speed.y < 0) {
                this.jumping = false;
                this.jumpActive = false;
                this.wallJumping = false;
            } else if (this.jumpActive) {
                if (this.jumpDelta > maxJumpTime) {
                    this.jumping = false;
                    this.jumpActive = false;
                    this.wallJumping = false;
                } else {
                    this.applyForce(0, accJump);
                }
            } else {
                if (this.jumpDelta > minJumpTime) {
                    this.jumping = false;
                    this.jumpActive = false;
                    this.wallJumping = false;
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
            if (this.onGround && this.acc.x != 0 && Math.abs(this.speed.x) > 8 && Math.sign(this.acc.x) != Math.sign(this.speed.x)) {
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

        // HAMMER TIME
        if (this.swinging) {
            if (this.swingTimer < swingTime) {
                var active = this.swingActive || this.swingTimer < swingMinTime;
                if (active) {
                    this.swingTimer += d;
                } else {
                    this.swingEndTimer += d;
                }
                var t = this.swingTimer / swingTime;
                t = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easing
                //t = t * (2 - t);

                var angle;
                var tx, ty;
                if (this.swingDirection > 0) {
                    angle = Math.PI * 3 / 4 - (2 * Math.PI * 6.5 / 4) * t;
                } else {
                    angle = Math.PI * 3 / 8 + (2 * Math.PI * 6.5 / 4) * t;
                }
                if (active) {
                    tx = 1.5 * t * t;
                    ty = (0.1 + 0.9 * t * t);
                } else {
                    tx = 2 * (0.7 + 0.3 * t);
                    ty = 5 * (0.1 + 0.2 * t * t);
                }
                if (active) {
                    this.applyForce(tx * 60 * Math.cos(angle), swingLiftAcc * Math.min(1, t * 60) + ty * 300 * Math.sin(angle));
                } else {
                    this.applyForce(tx * 60 * Math.cos(angle), swingLiftAcc + ty * 200 * Math.sin(angle));
                }

                var scale;
                if (active) {
                    scale = Math.min((0.5 - Math.abs(0.5 - t * t)) * 120, 1);
                } else {
                    scale = 1 - Math.pow(this.swingEndTimer / swingEndTime, 2);
                }
                scale = Math.max(scale, 0.01);
                var qangle = Math.floor(angle * 2) / 2;
                this.graphicHammer.scale.set(scale, scale, 1);
                this.graphicHammer.position.set(Math.cos(qangle) * 0.8, Math.sin(qangle) * 0.8, 0);
                this.graphicHammer.rotation.z = qangle - Math.PI / 2;
                this.graphicHammer.visible = true;

                this.emitter.position.value = this.emitter.position.value.set(this.pos.x + 2 * scale * Math.cos(angle), this.pos.y + 2 * scale * Math.sin(angle), 0);

                var index = Math.floor(t * this.swingingAnimation.length);
                if (index >= this.swingingAnimation.length) {
                    index = this.swingingAnimation.length - 1;
                }
                this.graphic.setTile(this.swingingAnimation[index]);

                decX *= 2.5;

                if (!this.swingActive && this.swingEndTimer >= swingEndTime) {
                    this.swingTimer = swingTime;
                    this.swinging = false;
                    this.graphicHammer.visible = false;
                    this.emitter.disable();
                }
            } else {
                this.swinging = false;
                this.graphicHammer.visible = false;
                this.emitter.disable();
            }
        }

        var decY = decV;
        if (this.wallSliding) {
            decY *= 4;
            //this.applyForce(0, wallSlideAcc);
        }

        var prevSpeedY = this.speed.y;
        this.speed.y += this.acc.y * d - this.speed.y * decY * d;
        this.pos.y += this.speed.y * d;

        // collision detection
        var topCol = this.topCol.check(this.pos.x, this.pos.y);
        // reset ground collision
        this.onGround = false;
        var groundCol = this.groundCol.check(this.pos.x, this.pos.y);

        // a special case for moving platforms
        if (!this.onGround && this.activeGround && prevSpeedY == 0) {
            var col = this.groundCol.getCollision(0) || this.groundCol.getCollision(1);
            if (col && this.activeGround.body.id == col.body.id) {
                this.pos.y = 0.5 + col.hit[1];
                this.speed.y = 0;
                this.onGround = true;
                this.activeGround = {
                    hit: col.hit,
                    body: col.body
                };
            }
        }

        this.speed.x += this.acc.x * d - this.speed.x * decX * d;
        this.pos.x += this.speed.x * d;

        if (this.onGround && this.activeGround && this.activeGround.body.delta) {
            this.pos.x += this.activeGround.body.delta[0];
        }

        var rightCol = this.rightCol.check(this.pos.x, this.pos.y);
        var leftCol = this.leftCol.check(this.pos.x, this.pos.y);

        if (this.skidding && (leftCol || rightCol)) {
            // TODO: fix so you can skid jump next to a wall but not from only running straight into it
            this.skidding = false;
            this.emitter.disable();
        }
        if (!this.wallJumping && (this.leftInContact && !leftCol || this.rightInContact && !rightCol)) {
            this.wallSliding = false;
            this.speed.x /= 8;
            this.emitter.disable();
        }
        this.leftInContact = leftCol;
        this.rightInContact = rightCol;
        //debug.log(topCol ? 1 : 0, groundCol ? 1 : 0, leftCol ? 1 : 0, rightCol ? 1 : 0, this.wallSliding);

        if (this.onGround && !this.moving && Math.abs(this.speed.x) < idleSpeedLimit) {
            if (!this.idle) {
                this.speed.x = 0;
                this.idle = true;
            }
        } else {
            this.idle = false;
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

        if (!this.swinging) {
            if (!this.idle && (this.moving || Math.abs(this.speed.x) > minAnimationSpeed)) {
                var animation = this.animations.run;
                animation.scale = 1 + Math.abs(this.speed.x / 6);
                animation.timer += d * animation.scale;
                if (animation.timer > animation.duration) {
                    animation.timer -= animation.duration;
                }
                this.graphic.setTile(animation.cycle[Math.floor(animation.cycle.length * animation.timer / animation.duration)]);
            } else {
                //this.graphic.setTile(0);
                var animation = this.animations.idle;
                animation.timer += d * animation.scale;
                if (animation.timer > animation.duration) {
                    animation.timer -= animation.duration;
                }
                this.graphic.setTile(animation.cycle[Math.floor(animation.cycle.length * animation.timer / animation.duration)]);
            }
        }

        if (this.wallSliding) {
            this.graphic.flipHorizontal(this.wallDirection > 0);
            this.graphic.setTile(11);
        }

        // reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;
        // reset movement
        this.moving = false;

        this.graphic.position.set(this.pos.x + (this.flipped ? -1 / 8 : 0) + this.spriteOffset.x, this.pos.y + this.spriteOffset.y, this.pos.z);
    };

    Bouncer.prototype.setRunning = function(bool) {
        this.running = bool;
    };

    Bouncer.prototype.swing = function() {
        if (!this.onGround && !this.wallSliding && !this.swung && !this.swinging && (this.jumpDelta >= swingMinJumpTime || this.speed.y < 0)) {
            var dir = this.flipped ? -1 : 1;
            this.speed.x = 0;
            this.speed.y = 0;
            this.swung = true;
            this.swinging = true;
            this.swingActive = true;
            this.swingTimer = 0;
            this.swingDirection = dir;

            this.jumping = false;
            this.jumpActive = false;
            this.wallJumping = false;

            this.emitter.enable();
        }
    };

    Bouncer.prototype.swingEnd = function() {
        if (this.swingActive) {
            this.swingActive = false;
            this.swingEndTimer = 0;
        }
    };

    Bouncer.prototype.jump = function() {
        if (this.onGround || this.wallSliding) {
            this.onGround = false;
            this.jumping = true;
            this.jumpActive = true;
            this.jumpDelta = 0;
            this.activeGround = null;

            var amount = 0.75 + 0.25 * Math.min(Math.abs(this.speed.x) / 40, 1);
            /*if (this.skidding) {
                this.speed.x = -this.skidDirection * 10;
                amount *= 1.2;
                this.skidTimer = 0;
            }*/
            if (this.wallSliding) {
                this.wallSliding = false;
                this.wallJumping = true;
                this.emitter.disable();
                this.speed.x = -this.wallDirection * 10;
                amount = 0.65;
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