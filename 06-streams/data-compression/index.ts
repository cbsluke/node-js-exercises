// 1) Take file as input
// 2) compress file using various algorithms (Brotli, Defalte, Gzip)
// 3) create summary table that compares algorithm compression times

import {createReadStream, createWriteStream} from "fs";
import {createBrotliCompress, createDeflate, createGzip} from 'zlib'
import {pipeline} from "stream";
import {hrtime} from "process";

type Record = {
    name: string,
    startDate: number,
    finalTime: number,
    startSize: number,
    endSize: number
}

const fileName = process.argv[2];
const inputStream = createReadStream(fileName);

const data = new Set<Record>(
    [
        {
            name: 'gzip',
            startDate: 0,
            finalTime: 0,
            startSize: 0,
            endSize: 0
        },
        {
            name: 'brotli',
            startDate: 0,
            finalTime: 0,
            startSize: 0,
            endSize: 0
        },
        {
            name: 'deflate',
            startDate: 0,
            finalTime: 0,
            startSize: 0,
            endSize: 0
        }
    ]
);

const actions = {
    gzip: createGzip,
    brotli: createBrotliCompress,
    deflate: createDeflate
}

data.forEach((item) => {
    const writeStream = createWriteStream(`./${fileName}.${item.name}`);
    const actionStream = actions[item.name]();

    inputStream.on('open', (chunk) => {
        console.log('opened', item.name, inputStream.bytesRead);
        item.startDate = Number(hrtime.bigint());
    });

    inputStream.on('data', (chunk) => {
        item.startSize = inputStream.bytesRead;
    });

    writeStream.on('finish', () => {
        item.endSize = writeStream.bytesWritten;
    });

    actionStream.on('finish', () => {
        const diff = Number(process.hrtime.bigint()) - item.startDate;
        const finalTime = convertHrtime(diff);
        item.finalTime = finalTime.milliseconds;
        console.log('finished gzip', item.name);
    });

    inputStream
        .pipe(actionStream)
        .pipe(writeStream);

    // NOTE: can also be written like this with error handling
    pipeline(
        inputStream,
        actionStream,
        writeStream,
        (err) => {
            if (err) {
                console.error('Pipeline failed', err);
            } else {
                console.log('Pipeline succeeded');
            }
        }
    )
});

function convertHrtime(hrtime) {
    const milliseconds = hrtime / 1000000;
    const seconds = hrtime / 1000000000;

    return {
        seconds,
        milliseconds,
        nanoSeconds: hrtime
    };
}
