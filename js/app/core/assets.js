define([
    "core/renderer",
    "entities/Sprite",
    "lib/three",
    "lib/spe"
], function(
    renderer,
    Sprite,
    THREE,
    SPE
) {

    var self = {
        load: load,
        files: {},
        createRectangle: createRectangle,
        createSprite: createSprite,
        createParticleEffect: createParticleEffect
    };

    return self;

    //////////////

    function load(files, callback) {
        var filesLeft = 0;

        for (var path in files) {
            if (files[path].toLowerCase() == "img") {
                var img = new Image();
                img.onload = onLoadCallback(r, path, img);
                img.src = path;
            } else {
                var r = new XMLHttpRequest();
                r.open("GET", path);
                r.onload = onLoadCallback(r, path);
                r.send();
            }
            filesLeft++;
        }

        function onLoadCallback(r, path, data) {
            return function() {
                if (typeof data != "undefined") {
                    self.files[path] = data;
                } else {
                    self.files[path] = r.responseData;
                }
                console.log(path, self.files[path]);
                if (!(filesLeft -= 1)) {
                    callback();
                }
            };
        }
    }

    function createRectangle(width, height, color) {
        var shape = new THREE.Shape();
        shape.moveTo(-width / 2, height / 2);
        shape.lineTo(-width / 2, -height / 2);
        shape.lineTo(width / 2, -height / 2);
        shape.lineTo(width / 2, height / 2);
        shape.lineTo(-width / 2, height / 2);

        var geom = new THREE.ShapeGeometry(shape);
        var mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
            color: color || 0x000000
        }));

        renderer.add(mesh);

        /*var geometry = new THREE.BoxGeometry(width, height, 1);
        var material = new THREE.MeshBasicMaterial({
            color: color || 0x000000
        });
        var mesh = new THREE.Mesh(geometry, material);*/

        return mesh;
    }

    function createSprite(image, width, height, spriteWidth, spriteHeight) {
        var sprite = new Sprite(image, width, height, spriteWidth, spriteHeight);

        renderer.add(sprite);

        return sprite;
    }

    function createParticleEffect(x, y) {
        var particleGroup = new SPE.Group({
            maxParticleCount: 25,
            texture: {
                value: THREE.ImageUtils.loadTexture('./img/particle.png')
            }
        });
        var emitter = new SPE.Emitter({
            maxAge: {
                value: 0.5
            },
            position: {
                value: new THREE.Vector3(0, 0, 0)
            },
            acceleration: {
                value: new THREE.Vector3(0, -2, 0),
                spread: new THREE.Vector3(2, 4, 0)
            },
            velocity: {
                value: new THREE.Vector3(1, 2, 0)
            },
            color: {
                value: [new THREE.Color(0.5, 0.5, 0.5), new THREE.Color()],
                //spread: new THREE.Vector3(1, 1, 1),
            },
            size: {
                value: [0.5, 0]
            },
            particleCount: 10
        });
        particleGroup.addEmitter(emitter);
        renderer.addParticleGroup(particleGroup);
        console.log('Total particles: ' + emitter.particleCount);

        return particleGroup;
    }

});