import * as fs from "fs";
import * as path from "path";

type Err = Error | null;
type Callback = (err: Err, keyword: string, result: string[]) => void;

function find(file: string, keyword: string, cb: any) {
    fs.readFile(path.resolve(`${file}`), 'utf8', (err, data) => {
        if (err)  return cb(err, file);

        if (data.trim().includes(keyword)) return cb(err, file);

        return cb(err);
    });
}

function findKeyword(dir: string, keyword: string, cb: Callback) {
    const result: string[] = [];

    fs.readdir(dir, (err, files) => {
        if (err) return cb(err, keyword, result);
        let pending = files.length;

        files.forEach(file => {
            fs.lstat(`${dir}/${file}`, (err, stats) => {
                const filePath = `${dir}/${file}`
                if (err) {
                    return cb(err, keyword, result);
                }
                if (stats.isDirectory()) {
                    // TODO implement traverse and only allow parallel amount to run
                    console.log('isDIR');
                } else {
                    find(filePath, keyword, (err: any, res: any) => {
                        if (err) return cb(err, keyword, result);
                        if (res) result.push(res);

                        pending--;

                        if (!pending) cb(null, keyword, result);
                    });
                }
            });
        });
    });
}

findKeyword(path.resolve(`${__dirname}/dir`), 'foo', (err, keyword, content) => {
    if (err) console.error(err);
    console.log('final', content);
});
