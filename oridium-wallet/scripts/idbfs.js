export function injectIDBFS(wasm) {
    wasm.FS.filesystems.IDBFS = {
      mount: function (mount) {
        return createNode("/", 16384 | 511); // S_IFDIR | 0777
      },
    };
  
    function createNode(name, mode) {
      const node = wasm.FS.createNode(null, name, mode, 0);
      node.node_ops = {
        getattr: function () {
          return {
            dev: 0,
            ino: 0,
            mode: 16895,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: 0,
            size: 0,
            atime: new Date(),
            mtime: new Date(),
            ctime: new Date(),
            blksize: 4096,
            blocks: 0,
          };
        },
        readdir: function () {
          return [];
        },
      };
      node.stream_ops = {};
      return node;
    }
  }
  