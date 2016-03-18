define(function() {

    var container = document.createElement("div");
    container.className = "message-container";
    document.body.appendChild(container);

    function Debug(color) {
        this.p = document.createElement("p");
        this.p.style.color = color || "#333333";
        container.appendChild(this.p);
    }

    Debug.prototype.log = function(...args) {
        //var args = Array.prototype.slice.call(arguments, 1);
        this.p.innerHTML = args.join(" ");
    };

    return Debug;

});