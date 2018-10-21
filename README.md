KICKTOCK
========

A simple way of doing asynchronous callbacks and Promises in JS.

```js
// 1. Setup the object. (Here we are firing progress every 2 seconds.)
var kicktock = require("kicktock")
var K = kicktock(2000)
K.on('progress', () => console.log(`${K.at} of ${K.total}`))

// 2. Wrap all the functions that get called asynchronously with `K`.
// This "adds" tasks to the kicktock.
var request = require('superagent')
var urls = ['http://httpbin.org/headers', 'http://httpbin.org/ip',
  'http://httpbin.org/delay/3', 'http://httpbin.org/uuid',
  'http://httpbin.org/user-agent']
urls.forEach(url => {
  request.get(url).set('Accept', 'application/json')
    .end(K((err, res) => {
      console.log(res.text)
    }))
})

// 3. Start the progress for the kicktock. (The callback will run when the
// tasks monitored by the kicktock are all complete.)
K.go(() => {
  console.log("Finished all requests.")
})
```

Installation
------------

```
npm install --save kicktock
```

How It Works
------------

The kicktock is a function that can wrap another function or Promise.

If the kicktock is given a function, it returns a new function. The new function
notifies the kicktock when the wrapped function is finished running.

```js
var K = kicktock()
fs.readFile(file1, 'utf8', K((err, data) => { ... })
fs.readFile(file2, 'utf8', K((err, data) => { ... })
K.go(() => console.log('DONE!'))
```

If the kicktock is given a Promise, it returns the Promise but will monitor it.
You can mix Promises and asynchronous functions as well.

```js
var K = kicktock()
K(request.get(url1).then(data => { ... })
K(request.get(url2).then(data => { ... })
K.go(() => console.log('DONE!'))
```

The `go` function is asynchronous as well---it will not wait for the kicktock to
end. It will immediately return and then the function supplied to it will run
when the kicktock *does* end.

If the `go` function is too confusing, you can separate it into an `end`
handler.

```js
K.on('end', () => console.log('DONE!'))
K.go()
```

You can also assign a progress event handler.

```js
count.on('progress', () => {
  console.log(`Completed ${count.at} of ${count.total} tasks.`)
})
```

The `at` property tells you how many tasks are currently completed.
The `total` property tells you how many tasks are currently queued.

**PLEASE NOTE:** Progress tracking is very loose---because all asynchronous
functions are executed in parallel, many will finish before more have been
queued. This means that percentages on many short-running tasks will stay close
to 100%.

By default, the progress function will fire for every item. You can also use a
timer if you supply a microsecond count when you create the kicktock.

Error Handling
--------------

One really nice feature of the kicktock is that you can log all errors from any
monitored Promises or callbacks.

```js
var K = kicktock()
K.on('error', e => console.log(e))
```

This will work automatically for Promises.

For callbacks, you'll need to manually throw the errors. (Any exceptions thrown
inside the callback or by the caller will be caught by the kicktock.)

```js
fs.readFile(file1, 'utf8', K((err, data) => {
  if (err) throw err
  console.log(data)
})
```

However, if the callback you are using is an
[error-first](https://nodejs.org/api/errors.html#errors_error_first_callbacks)
callback (the error is the first argument in the callback), then you can have
kicktock automatically handle the error by using the `errorFirst` function.

```js
fs.readFile(file1, 'utf8', K.errorFirst(data => {
  console.log(data)
})
```

Notice that, if you take this approach, the error argument is removed from the
callback, since the kicktock is handling it now.
