self.Module = {
    onRuntimeInitialized: function () {
        postMessage({ type: 'ready' });
    }
};

importScripts("../wasm/mining.js"); // <- importe mining.js APRÈS la déclaration Module ci-dessus

onmessage = function (e) {
    if (e.data === 'start') {
        mine();
    } else if (e.data === 'stop') {
        close();
    }
};

function mine() {
    while (true) {
        const result = self.Module.ccall('mine', 'string', [], []);
        self.postMessage({ type: 'result', data: result });
    }
}