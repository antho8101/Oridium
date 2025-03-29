self.Module = {
    locateFile: function(path) {
        return "../wasm/" + path;
    },
    onRuntimeInitialized: function() {
        postMessage({type: 'ready'});
    }
};

importScripts("../wasm/mining.js");

onmessage = function(e) {
    if (e.data === 'start') {
        mine();
    } else if (e.data === 'stop') {
        close();
    }
};

function mine() {
    while (true) {
        const result = Module.ccall('mine', 'string', [], []);
        postMessage({type: 'result', data: result});
    }
}