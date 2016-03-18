requirejs.config({
    baseUrl: "js/app",
    paths: {
        lib: "../lib"
    },
    shim: {
        "lib/three": {
            exports: "THREE"
        },
        "lib/spe": {
            deps: ["lib/three"],
            exports: "SPE"
        },
        "lib/p2": {
            exports: "p2"
        }
    }
});