define(function() {

    var self = {
        onKeyDown: onKeyDown,
        onKeyStart: onKeyStart,
        onKeyEnd: onKeyEnd,
        update: update
    };

    var keyStartListeners = [];
    var keyEndListeners = [];
    var keyDownListeners = [];

    var keys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        32: "space",
        13: "enter",
        90: "action1", // Z
        88: "action2", // X
        67: "action3", // C
        86: "action4", // V
        17: "mod1",
        16: "mod2"
    };
    var buttons = {
        0: "action1",
        1: "action2",
        2: "action3",
        3: "action4",
        4: "action5",
        5: "action6",
        6: "action7",
        7: "action8"
    };
    var keysMap = {};
    var buttonsMap = {};
    var mods = {
        ctrlKey: "mod1",
        shiftKey: "mod2"
    };
    var modKeys = {};

    var keyEvents = {};
    var gamepadEvents = {};

    var gamepads = [];

    init();

    return self;

    ///////////////

    function init() {
        for (var key in keys) {
            keysMap[keys[key]] = key;
        }
        for (var button in buttons) {
            buttonsMap[buttons[button]] = button;
        }

        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);

        window.addEventListener("gamepadconnected", function(e) {
            gamepadHandler(e, true);
        }, false);
        window.addEventListener("gamepaddisconnected", function(e) {
            gamepadHandler(e, false);
        }, false);

        function keyDownHandler(evt) {
            var code = evt.keyCode;
            if (keys[code]) {
                if (!keyEvents[code]) {
                    updateModKeys(evt);
                    keyEvents[code] = true;
                    for (var i = 0; i < keyStartListeners.length; i++) {
                        keyStartListeners[i](keys[code], modKeys);
                    }
                }
            }
        }

        function keyUpHandler(evt) {
            var code = evt.keyCode;
            if (keys[code]) {
                if (keyEvents[code]) {
                    updateModKeys(evt);
                    keyEvents[code] = false;
                    for (var i = 0; i < keyEndListeners.length; i++) {
                        keyEndListeners[i](keys[code], modKeys);
                    }
                }
            }
        }

        function gamepadHandler(evt, connecting) {
            var gamepad = evt.gamepad;

            /*if (connecting) {
                console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                    gamepad.index, gamepad.id,
                    gamepad.buttons.length, gamepad.axes.length);
            } else {
                console.log("Gamepad %s disconnected", gamepad.id);
            }*/

            if (connecting) {
                gamepads[gamepad.index] = gamepad;
            } else {
                delete gamepads[gamepad.index];
            }
        }
    }

    function update() {
        //var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

        var newGamepadEvents = {};
        for (var id = 0; id < gamepads.length; id++) {
            var gamepad = gamepads[id];

            if (gamepad) {
                gamepad.axes.forEach(function(val, i) {
                    var pressed = Math.abs(val) > 0.2;
                    var dir = Math.round(val);
                    if (i == 0) {
                        newGamepadEvents.left = pressed && dir < 0;
                        newGamepadEvents.right = pressed && dir > 0;
                    } else {
                        newGamepadEvents.up = pressed && dir < 0;
                        newGamepadEvents.down = pressed && dir > 0;
                    }
                });

                gamepad.buttons.forEach(function(button, i) {
                    newGamepadEvents[buttons[i]] = button.pressed;
                });
            }
        }

        for (var key in newGamepadEvents) {
            if (newGamepadEvents[key]) {
                if (gamepadEvents[key]) {
                    for (var i = 0; i < keyDownListeners.length; i++) {
                        keyDownListeners[i](key, modKeys);
                    }
                } else {
                    for (var i = 0; i < keyStartListeners.length; i++) {
                        keyStartListeners[i](key, modKeys);
                    }
                }
            } else if (gamepadEvents[key]) {
                for (var i = 0; i < keyEndListeners.length; i++) {
                    keyEndListeners[i](key, modKeys);
                }
            }
        }
        gamepadEvents = newGamepadEvents;

        for (var key in keyEvents) {
            if (keyEvents[key]) {
                for (var i = 0; i < keyDownListeners.length; i++) {
                    keyDownListeners[i](keys[key], modKeys);
                }
            }
        }
    }

    function updateModKeys(evt) {
        for (var key in mods) {
            modKeys[mods[key]] = evt[key];
        }
    }

    function onKeyDown(f) {
        keyDownListeners.push(f);
    }

    function onKeyStart(f) {
        keyStartListeners.push(f);
    }

    function onKeyEnd(f) {
        keyEndListeners.push(f);
    }

});