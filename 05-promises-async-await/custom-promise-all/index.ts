const promiseOne = new Promise((resolve) => {
    setTimeout(() => {
        resolve(1);
    }, 5000);
});
const promiseTwo = async function () {
    const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await res.json();
    return data;
}

function promise3() {
    return new Promise((resolve) => {
        resolve(3);
    });
}
// PromiseLike is an interface that has a then method to return an onreject and onfulfilled
async function PromiseAllSync<T>(tasks: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
    const results = [];
    for (const task of tasks) {
        try {
            const res = await task;
            results.push(res);
        } catch (error) {
            results.push(error);
        }
    }
    return results;
}

function PromiseAllParra<T>(tasks: Array<T | PromiseLike<T>>): Promise<Awaited<T>[]> {

    return new Promise((resolve, reject) => {
        const results = [];
        for (const task of tasks) {
            Promise.resolve(task).then((res) => {
                results.push(res);
                console.log(res)
                if (results.length === tasks.length) {
                    resolve(results);
                }
            }).catch((error) => {
                results.push(error);
                if (results.length === tasks.length) {
                    resolve(results);
                }
            });
        }
    });
}



function PromiseAllSettled<T>(tasks: Array<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
    return new Promise((resolve, reject) => {
        const results = [];
        for (const task of tasks) {
            Promise.resolve(task).then((res) => {
                results.push(true);
                if (results.length === tasks.length) {
                    resolve(results);
                }
            }).catch((error) => {
                results.push(false);
                if (results.length === tasks.length) {
                    resolve(results);
                }
            });
        }
    });
}

PromiseAllSync([promiseOne, promiseTwo(), promise3()])
    .then(() => console.log('done'));

PromiseAllParra([promiseOne, promiseTwo(), promise3()])
    .then((res) => console.log('done', res));

// Promise.all([promiseOne, promiseTwo(), promise3()])
//     .then((values) => {
//         console.log(values);
//     });
