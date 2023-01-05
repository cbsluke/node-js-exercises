import * as fs from "fs";
import * as path from "path";
function find(file, keyword, cb) {
    fs.readFile(path.resolve("".concat(file)), 'utf8', function (err, data) {
        if (err)
            return cb(err, file);
        if (data.trim().includes(keyword))
            return cb(err, file);
        return cb(err);
    });
}
function findKeyword(dir, keyword, cb) {
    var result = [];
    fs.readdir(dir, function (err, files) {
        if (err)
            return cb(err, keyword, result);
        var pending = files.length;
        files.forEach(function (file) {
            fs.lstat("".concat(dir, "/").concat(file), function (err, stats) {
                var filePath = "".concat(dir, "/").concat(file);
                if (err) {
                    return cb(err, keyword, result);
                }
                if (stats.isDirectory()) {
                    // TODO implement traverse and only allow parallel amount to run
                    console.log('isDIR');
                }
                else {
                    find(filePath, keyword, function (err, res) {
                        if (err)
                            return cb(err, keyword, result);
                        if (res)
                            result.push(res);
                        pending--;
                        if (!pending)
                            cb(null, keyword, result);
                    });
                }
            });
        });
    });
}
findKeyword(path.resolve("".concat(__dirname, "/dir")), 'foo', function (err, keyword, content) {
    if (err)
        console.error(err);
    console.log('final', content);
});
