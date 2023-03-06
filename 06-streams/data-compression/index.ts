// 1) Take file as input
// 2) compress file using various algorithms (Brotli, Defalte, Gzip)
// 3) create summary table that compares algorithm compression times

import {createReadStream, createWriteStream} from "fs";
import {createBrotliCompress, createDeflate, createGzip} from 'zlib'
import {PassThrough} from "stream";
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
    const passThrough = new PassThrough();
    const passEnd = new PassThrough();

    inputStream
        .pipe(startMonitor(passThrough, item))
        .pipe(actions[item.name]())
        .pipe(endMonitor(passEnd, item))
        .pipe(createWriteStream(`./${fileName}.${item.name}`));
});

function startMonitor(stream: PassThrough, item: Record) {
    stream.on('resume', () => {
        console.log('started', item.name);
        item.startDate = Number(hrtime.bigint());
    });

    stream.on('data', (chunk) => {
        item.startSize += chunk.length;
    });

    return stream;
}

function endMonitor(stream: PassThrough, item: Record) {
    stream.on('data', (chunk) => {
        item.endSize += chunk.length;
    });

    stream.on('end', () => {
        const diff = Number(process.hrtime.bigint()) - item.startDate;
        const finalTime = convertHrtime(diff);
        item.finalTime = finalTime.milliseconds;
        console.log(item);
    });

    return stream
}

function convertHrtime(hrtime) {
	const milliseconds = hrtime / 1000000;
	const seconds = hrtime / 1000000000;

	return {
		seconds,
		milliseconds,
        nanoSeconds: hrtime
	};
}
