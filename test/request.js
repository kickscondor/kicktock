// 1. Setup the object. (Here we are firing progress every 2 seconds.)
var kicktock = require("../kicktock")
var K = kicktock(300)
K.on('progress', () => console.log(`${K.at} of ${K.total}`))

// 2. Wrap all the functions that get called asynchronously with `K`.
// This "adds" tasks to the kicktock.
var request = require('superagent')
var urls = ['http://httpbin.org/headers', 'http://httpbin.org/ip',
  'http://httpbin.org/delay/3', 'http://httpbin.org/uuid',
  'http://httpbin.org/user-agent']
urls.forEach(url => {
  K(request.get(url).set('Accept', 'application/json')
    .then(res => {
      console.log(res.text)
    }))
})

// 3. Start the progress for the kicktock. (The callback will run when the
// tasks monitored by the kicktock are all complete.)
K.go(() => {
  console.log("Finished all requests.")
})
