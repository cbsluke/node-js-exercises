import * as fs from "fs";
import * as path from "path";
// NOTE: we could clean this up by adding some helper function
// to avoid callback hell and heavy nesting
function listNestedFiles(dir, cb) {
    var result = [];
    fs.readdir(dir, function (err, files) {
        if (err)
            return cb(err, result);
        var pending = files.length;
        files.forEach(function (file) {
            fs.lstat("".concat(dir, "/").concat(file), function (err, stats) {
                if (err) {
                    console.log('err');
                    return cb(err, result);
                }
                if (stats.isDirectory()) {
                    listNestedFiles("".concat(dir, "/").concat(file), function (err, res) {
                        result.push.apply(result, res);
                        pending--;
                        if (!pending) {
                            console.log(result);
                            cb(null, result);
                        }
                    });
                }
                else {
                    result.push(file);
                    pending--;
                    if (!pending) {
                        console.log('bottom', result);
                        cb(null, result);
                    }
                }
            });
        });
    });
}
listNestedFiles(path.resolve("".concat(__dirname, "/dir")), function (err, content) {
    if (err)
        console.error(err);
    console.log('result', content);
});
