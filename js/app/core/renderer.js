define(["lib/three"], function(THREE) {

    var self = {
        width: 800,
        height: 400,

        add: add,
        addParticleGroup: addParticleGroup,
        remove: remove,
        render: render,
        update: update,
        getChildren: getChildren
    };

    var scene, camera, r;

    var backgroundColor = 0xf1c55b; //0xCDDBDE;

    var particleGroups = [];

    init();

    return self;

    //////////////

    function init() {
        r = new THREE.WebGLRenderer();
        r.setSize(self.width, self.height);
        r.setClearColor(backgroundColor);
        document.body.appendChild(r.domElement);

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-self.width / 2, self.width / 2, self.height / 2, -self.height / 2, 1, 1000);
        camera.position.set(0, 3, 10);
        camera.zoom = 30;
        camera.updateProjectionMatrix();
    }

    function add(obj) {
        scene.add(obj);
    }

    function addParticleGroup(group) {
        particleGroups.push(group);
        self.add(group.mesh);
    }

    function remove(obj) {
        scene.remove(obj);
    }

    function render() {
        r.render(scene, camera);
    }

    function update(d) {
        for (var i = 0; i < particleGroups.length; i++) {
            particleGroups[i].tick(d);
        }
    }

    function getChildren() {
        return scene.children;
    }

});