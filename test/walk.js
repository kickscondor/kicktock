var fs = require('fs'),
    path = require('path');

module.exports = function walk(dir, walkCb, finishCb, limit) {
    function callWalkCb(err, file, stats, cb) {
        walkCb(err, file, stats);
        cb();
    }

    function callFinishCb() {
        finishCb && finishCb();
    }

    fs.stat(dir, function(err, stats) {
        if(err) {
            return callWalkCb(err, dir, stats, callFinishCb);
        }
        if(stats.isDirectory()) {
            if (limit !== undefined && limit == 0) {
                callFinishCb();
                return;
            }
            fs.readdir(dir, function(err, files) {
                if(err) {
                    return callWalkCb(err, dir, stats, callFinishCb);
                }

                var count = files.length + 1;
                files.forEach(function(file) {
                    walk(path.join(dir, file), walkCb, function(err) {
                        if(err) {
                            return callWalkCb(err, file, null, callFinishCb);
                        }
                        after();
                    }, limit > 0 ? limit - 1 : limit);
                });

                after();

                function after() {
                    if(--count == 0) {
                        callFinishCb();
                    }
                }
            });
        }
        else {
            callWalkCb(err, dir, stats, callFinishCb);
        }
    });
};
