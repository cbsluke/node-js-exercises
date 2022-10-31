import * as fs from "fs";
import * as path from "path";

type Err = Error | null;
type Callback = (err: Err, result: string[]) => void;

function listNestedFiles(dir: string, cb: Callback) {
    const result: string[] = [];

    fs.readdir(dir, (err, files) => {
        if (err) return cb(err, result);
        let pending = files.length;

        files.forEach(file => {
            fs.lstat(`${dir}/${file}`, (err, stats) => {
                if (err) {
                    console.log('err');
                    return cb(err, result);
                }

                if (stats.isDirectory()) {
                    listNestedFiles(`${dir}/${file}`, (err, res) => {
                        result.push(...res);
                        pending--;

                        if (!pending) {
                            console.log(result);
                            cb(null, result);
                        }
                    });
                } else {
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

listNestedFiles(path.resolve(`${__dirname}/dir`), (err: Error, content: any) => {
    if (err) console.error(err);
    console.log('result', content);
});
