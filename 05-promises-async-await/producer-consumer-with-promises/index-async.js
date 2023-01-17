export class TaskConsumerQueue {
    constructor(concurrency) {
        this.taskQueue = [];
        this.consumerQueue = [];
        // spawn consumers
        for (let i = 0; i < concurrency; i++) {
            this.consumer();
        }
    }
    async consumer() {
        while (true) {
            try {
                const interval = setInterval(() => {
                    console.log('consumer', interval);
                }, 500);
                const task = await this.getNextTask();
                clearInterval(interval);
                console.log('cleared');
                await task();
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    getNextTask() {
        return new Promise((resolve) => {
            if (this.taskQueue.length !== 0) {
                return resolve(this.taskQueue.shift());
            }
            this.consumerQueue.push(resolve);
        });
    }
    runTask(task) {
        return new Promise((resolve, reject) => {
            const taskWrapper = () => {
                console.log('taskWrapper');
                const taskPromise = task();
                taskPromise.then(resolve, reject);
                return taskPromise;
            };
            if (this.consumerQueue.length !== 0) {
                // there is a sleeping consumer available, use it to run our task
                const consumerSlot = this.consumerQueue.shift();
                consumerSlot(taskWrapper);
                console.log('consumerSlot');
            }
            else {
                // all consumers are busy, enqueue the task
                this.taskQueue.push(taskWrapper);
            }
        });
    }
}
const taskQueue = new TaskConsumerQueue(2);
taskQueue.runTask(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('task1');
        }, 5000);
    });
})
    .then(() => console.log('task 1 done'));
//
// taskQueue.runTask(() => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve('task2')
//         }, 1000);
//     });
// })
//     .then(() => console.log('task 2 done'));
//
// taskQueue.runTask(() => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve('task3')
//         }, 3000);
//     });
// })
//     .then(() => console.log('task 3 done'));
//
// taskQueue.runTask(() => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve('task4')
//         }, 3000);
//     });
// })
//     .then(() => console.log('task 4 done'));
