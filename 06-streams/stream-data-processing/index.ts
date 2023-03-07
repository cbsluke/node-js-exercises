// 1) Did the number of crimes go up or down over the years
// 2) What is the most dangerous areas
// 3) What is the most common crime
// 4) What is the least common crime
// lsoa_code,borough,major_category,minor_category,value,year,month
// E01001116,Croydon,Burglary,Burglary in Other Buildings,0,2016,11

import {createReadStream} from "fs";
import {PassThrough, Transform} from "stream";

type CrimeLocation = {
    lsoa_code: string;
    borough: string;
    major_category: string;
    minor_category: string;
    value: number;
    year: number;
    month: number;
};

const data = new Map<any, any>();
// const readStream = createReadStream('london.csv', 'utf8');
const readStream = createReadStream('test.csv', 'utf8');
let headings = [];

class ProcessCrimeData extends Transform {
    private head: string;

    constructor() {
        super();
        this.head = '';
    }

    _transform(chunk: string, encoding: string, callback: Function) {
        console.log('chunk', this.head + chunk.toString());
        const lines = (this.head + chunk.toString()).split('\n');
        this.head = '';

        if (!headings.length) {
            headings = getHeadings(lines[0]);
            lines.shift();
        }

        const lastLine = lines.pop();
        this.head += lastLine;
        const lastLineColumns = getColumns(this.head);
        let newChunk = '';

        if (lastLineColumns.length !== headings.length) {
            newChunk = chunk.slice(0, chunk.length - this.head.length);
        } else {
            newChunk = chunk
        }

        this.push(newChunk);

        callback();
    }

    _flush(callback: Function) {
        console.log('flush', this.head)
        callback();
    }
}

const processCrimeData = new ProcessCrimeData();
const passThrough = new PassThrough();

readStream.pipe(processCrimeData).pipe(passThrough);

passThrough.on('data', (chunk) => {
    // console.log('chunk', chunk.toString());
});

function readLines(lines) {
    const lastLine = lines[lines.length - 1];
    const lastLineColumns = getColumns(lastLine);

    if (lastLineColumns.length !== headings.length) {
        console.log('Invalid line', lastLineColumns);
    }

    lines.forEach((line) => {
        const columns = getColumns(line)

        const [
            id,
            borough,
            major_category,
            minor_category,
            value,
            year,
            month
        ] = columns;

        const crimeYear = parseInt(year);
        const crimeValue = parseInt(value);

        if (!data.has(crimeYear)) {
            data.set(crimeYear, crimeValue);
            return;
        }

        const currentValue = data.get(crimeYear);
        const newValue = currentValue + crimeValue;
        data.set(crimeYear, newValue);
    });
}

function getHeadings(line: string) {
    return headings = getColumns(line);
}

function getColumns(line: string) {
    return line.split(',');
}
