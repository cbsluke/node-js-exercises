function wrapInPromise(value: any) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(value);
        }, 1000);
    });
}

const asyncNames = [() => {
    return Promise.resolve('John');
}, () => {
    return wrapInPromise('Bob')
}, () => {
    return wrapInPromise('Eve')
}];

function asyncMap(asyncItems: any, action: (item: any) => any, concurrency: number = 1) {
    let taskQueue = [];
    let queue = [...asyncItems];
    let result = [];
    return new Promise((resolve) => {
        async function consumer(itemPromise) {
            console.log(`starting consumer ${await itemPromise}`);
            const res = await itemPromise;
            result.push(action(res));
            taskQueue.shift();

            if (queue.length === 0 && taskQueue.length === 0) {
                resolve(result);
            }
        }

        while (queue.length > 0) {
            if (taskQueue.length < concurrency) {
                const item = queue.shift();
                taskQueue.push(item);
                consumer(item());
            }
        }
    });
}

const asyncGreetNames = await asyncMap(asyncNames, (name) => {
    return `Hello, ${name}!`;
}, 2);

console.log('done', asyncGreetNames);

