import * as fs from 'fs';
import * as path from "path";

type ConcatCallback = (err: Error | null) => void;

function concatFiles(files: string[], dest: string, cb: ConcatCallback) {
    if (!files.length) {
        return cb(null)
    }

    console.log(files);
    fs.readFile(path.resolve(`${__dirname}/files/${files[0]}`), 'utf8', (err, data) => {
        if (err) {
            return cb(err);
        }

        console.log(files[0], data);
        fs.writeFile(path.resolve(`${__dirname}/dest/${dest}`), data.trim(), {flag: 'a+'}, err => {
            if (err) {
                return cb(err);
            }

            files.shift();
            concatFiles(files, dest, cb);
        });
    });
}

// NOTE: we could handle the unknown if it was in the middle. Rather than writing content each recursion we
// do the writing on completion of reading the contents. That way we won't exit in the middle
// however main idea remains.
concatFiles(['sample1.txt', 'sample2.txt', 'unknown.txt'], 'output.txt', (err) => {
    if (err) return console.error(err);
    console.log("complete");
});
