mergeInto(LibraryManager.library, {
  $IDBFS__postset: 'FS.filesystems.IDBFS = IDBFS;',
  $IDBFS: {
    mount: function () {
      return {};
    },
    createNode: function () {},
    getMode: function () {},
    isDir: function () {},
    isFile: function () {}
  }
});