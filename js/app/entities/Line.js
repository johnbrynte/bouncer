define([
    "core/renderer"
], function(
    renderer
) {

    function Line(dx, dy, color) {
        var h = Math.sqrt(dx * dx + dy * dy);
        this.dx = dx / h;
        this.dy = dy / h;

        var material = new THREE.LineBasicMaterial({
            color: color || 0xff0000,
            linewidth: 2
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(this.dx, this.dy, 0));

        var line = new THREE.Line(geometry, material);

        renderer.add(line);

        this.geometry = geometry;
        this.line = line;
        console.log(this.dx, this.dy, h);

        this.setLength(h);
    }

    Line.prototype = Object.create(THREE.Line.prototype);

    Line.prototype.setPos = function(x, y) {
        this.line.position.set(x, y, 2);
    };

    Line.prototype.setColor = function(color) {
        this.line.material.color = color;
    };

    Line.prototype.setLength = function(l) {
        var dx = Math.max(Math.abs(this.dx * l), 0.001);
        var dy = Math.max(Math.abs(this.dy * l), 0.001);
        this.line.scale.set(dx, dy, 1);
    };

    return Line;

});