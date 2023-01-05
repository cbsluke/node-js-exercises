class TaskQueue {
    private queue: any[]
    private running: number;
    private concurrency: number;

    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    runTask(task) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    resolve(await task());
                } catch (error) {
                    reject(error);
                }
            });
            process.nextTick(this.next.bind(this))
        })
    }

    next() {
        while (this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift()
            this.running++
            (async () => {
                await task();
                this.running--
                this.next()
            })();
        }
    }
}

const taskQueue = new TaskQueue(2)

taskQueue.runTask(async () => {
    setTimeout(() => {
    }, 8000);
})
    .then(() => console.log('task 1 done'));

taskQueue.runTask(async () => {
    setTimeout(() => {
    }, 5000);
})
    .then(() => console.log('task 2 done'));
taskQueue.runTask(async () => {
    setTimeout(() => {
    }, 1000);
})
    .then(() => console.log('task 3 done'));
taskQueue.runTask(async () => {
    setTimeout(() => {
    }, 1000);
})
    .then(() => console.log('task 4 done'));
