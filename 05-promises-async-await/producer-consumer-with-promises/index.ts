export class TaskQueuePC {
    private taskQueue: (() => Promise<unknown>)[];
    private consumerQueue: ((value: unknown) => void)[];

    constructor(concurrency) {
        this.taskQueue = []
        this.consumerQueue = []

        // spawn consumers
        for (let i = 0; i < concurrency; i++) {
            this.consumer()
        }
    }

    consumer() {
        return new Promise((resolve, reject) => {
            (function internal(){
                this.getNextTask()
                    .then((wrapper) => {
                        wrapper();
                        internal.call(this);
                    })
                    .catch(reject);
            }).bind(this)();
        });
    }

    getNextTask(): any {
        return new Promise((resolve) => {
            if (this.taskQueue.length !== 0) {
                return resolve(this.taskQueue.shift())
            }

            this.consumerQueue.push(resolve)
        })
    }

    runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = (): Promise<unknown> => {
                const taskPromise = task()
                taskPromise.then(resolve, reject)
                return taskPromise
            }
            console.log('consumerQueue', this.consumerQueue.length)
            if (this.consumerQueue.length !== 0) {
                console.log('consumerQueue', this.consumerQueue)
                // there is a sleeping consumer available, use it to run our task
                const consumer = this.consumerQueue.shift()
                consumer(taskWrapper)
            } else {
                // all consumers are busy, enqueue the task
                console.log('added to queue');
                this.taskQueue.push(taskWrapper)
            }
        })
    }
}

const taskQueue = new TaskQueuePC(2)
taskQueue.runTask(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('task1')
        }, 8000);
    });
})
    .then(() => console.log('task 1 done'));

taskQueue.runTask(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('task2')
        }, 5000);
    });
})
    .then(() => console.log('task 2 done'));

taskQueue.runTask(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('task3')
        }, 9000);
    });
})
    .then(() => console.log('task 3 done'));





