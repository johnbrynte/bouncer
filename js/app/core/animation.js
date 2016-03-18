define([], function() {

    var self = {};

    var intervals = {};
    var animations = {};

    var nextIntervalID = 0;
    var nextAnimationID = 0;

    var now = Date.now();
    var kill = null;

    self.easing = {
        'SMOOTH': function(d) {
            return 2 * d - Math.pow(d, 2);
        }
    };

    /**
     * Updates all the ongoing animations.
     * Relies on continous updating.
     */
    self.update = function() {
        var key;
        now = Date.now();
        for (key in animations) {
            if (!animations[key]._animationLoop()) {
                kill = key;
            }
        }
        if (kill) {
            delete animations[kill];
        }
        for (key in intervals) {
            intervals[key]._animationLoop();
        }
    };

    /**
     * Adds an interval (based on Window.setInterval).
     * @param {function} callback Callback function.
     * @param {Number} interval Interval in milliseconds.
     * @returns id for the new interval
     */
    self.addInterval = function(callback, interval) {
        var id = nextIntervalID;
        var anim = {
            callback: callback,
            interval: interval,
            _prevTime: now
        };

        anim._animationLoop = function() {
            if (now - anim._prevTime > anim.interval) {
                anim.callback();
                anim._prevTime = now;
            }
        };

        intervals[id] = anim;
        nextIntervalID++;

        return id;
    };

    self.removeInterval = function(id) {
        intervals[id] = null;
        delete intervals[id];
    };

    /**
     * Animates any desired property.
     * @param options An object defining the animation:
     *  loop: The animation loop is given a number in the range
     *      [0, 1] as the only parameter, defining the position
     *      in the animation.
     *  easing: An easing function may be defined. The function
     *      is given a parameter in the range [0, 1] and should
     *      return a number in the range [0, 1].
     *  callback: A function called when the animation is over.
     *  duration: The duration of the animation, measured in
     *      milliseconds.
     */
    self.animate = function(options) {
        var id,
            anim = options;
        if (typeof anim.loop === 'undefined') {
            anim.loop = function() {};
        }
        if (typeof anim.easing === 'undefined') {
            // Set a linear easing function as default
            anim.easing = function(d) {
                return d;
            };
        }
        if (typeof anim.duration === 'undefined') {
            anim.duration = 1000;
        }
        /**
         * The function returns true if the animation is still
         * running, otherwise false.
         */
        anim._animationLoop = function() {
            // Only loop if needed
            if (now - anim._prevTime > 0) {
                // Call the loop function with the new value
                anim._delta += (now - anim._prevTime) / anim.duration;
                if (anim._delta > 1) {
                    anim._delta = 1;
                }
                anim._prevTime = now;
                anim.loop(Math.abs(anim.easing(anim._delta)));
            }

            if (now - anim._startTime < anim.duration) {
                return true;
            }
            // In case the easing function is bad
            anim.loop(1);
            if (anim.callback) {
                anim.callback();
            }
            if (!!anim.continuous) {
                // restart the loop
                anim._startTime = now;
                anim._delta = 0;
                return true;
            }

            return false;
        };

        anim._delta = 0;
        // Reset the timer
        anim._startTime = now;
        anim._prevTime = anim._startTime;

        id = nextAnimationID;
        animations[id] = anim;
        nextAnimationID++;

        return id;
    };

    self.removeAnimation = function(id) {
        if (id in animations) {
            delete animations[id];
        }
    };

    return self;

});