import * as fs from "fs";
import * as path from "path";
function find(file, keyword, cb) {
    fs.readFile(path.resolve(`${file}`), 'utf8', (err, data) => {
        if (err)
            return cb(err, file);
        if (data.trim().includes(keyword))
            return cb(err, file);
        return cb(err);
    });
}
function findKeyword(dir, keyword, cb) {
    const result = [];
    fs.readdir(dir, (err, files) => {
        if (err)
            return cb(err, keyword, result);
        let pending = files.length;
        files.forEach(file => {
            fs.lstat(`${dir}/${file}`, (err, stats) => {
                const filePath = `${dir}/${file}`;
                if (err) {
                    return cb(err, keyword, result);
                }
                if (stats.isDirectory()) {
                    // TODO implement traverse and only allow parallel amount to run
                    console.log('isDIR');
                }
                else {
                    find(filePath, keyword, (err, res) => {
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
findKeyword(path.resolve(`${__dirname}/dir`), 'foo', (err, keyword, content) => {
    if (err)
        console.error(err);
    console.log('final', content);
});
