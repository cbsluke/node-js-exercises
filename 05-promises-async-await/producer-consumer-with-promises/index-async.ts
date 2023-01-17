export class TaskConsumerQueue {
    public taskQueue: (() => Promise<unknown>)[];
    public consumerQueue: ((value: unknown) => void)[];

    constructor(concurrency) {
        this.taskQueue = []
        this.consumerQueue = []

        // spawn consumers
        for (let i = 0; i < concurrency; i++) {
            this.consumer()
        }
    }

    async consumer() {
        while (true) {
            console.log('starting')
            try {
                // const interval = setInterval(() => {
                //     console.log('interval', Number(interval));
                // }, 500);
                // console.log('intervalID:', Number(interval));
                const task = await this.getNextTask()
                // clearInterval(interval);
                console.log('2');
                await task();
                console.log('4');
            } catch (err) {
                console.error(err)
            }
        }
    }

    getNextTask(): Promise<() => Promise<unknown>> {
        return new Promise((resolve) => {
            if (this.taskQueue.length !== 0) {
                return resolve(this.taskQueue.shift())
            }

            this.consumerQueue.push(resolve)
            console.log(`consumerQueue:`, this.consumerQueue.length)
        })
    }

    runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = () => {
                console.log('3')
                const taskPromise = task()
                taskPromise.then(resolve, reject)
                return taskPromise
            }

            if (this.consumerQueue.length !== 0) {
                // there is a sleeping consumer available, use it to run our task
                const consumerSlot = this.consumerQueue.shift()
                consumerSlot(taskWrapper);
                console.log('1')
            } else {
                // all consumers are busy, enqueue the task
                this.taskQueue.push(taskWrapper)
            }
        })
    }
}

const taskQueue = new TaskConsumerQueue(2)

taskQueue.runTask(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('task1')
        }, 1000);
    });
})
    .then(() => {
        console.log('task 1 done', taskQueue.consumerQueue.length);
    });


