def callback(commit):
    if commit.original_id == b"2c1e65015f6c8f1276c418cab688024f28922efd":
        commit.skip()
