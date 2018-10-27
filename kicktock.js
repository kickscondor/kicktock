const EventEmitter = require('events').EventEmitter

//
// A 'kicktock' is used to monitor asynchronous functions and to notify you
// concerning progress and completion of the tasks. This way you can monitor
// many varied tasks with a single kicktock---then move on after they are
// done. (See README.md for more.)
//
module.exports = function kicktock (progress = null) {
  let K = function (fn) {
    let onErr = function (e) {
      if (K.emitter.listenerCount('error') == 0) {
        if (module.exports.errorHandler)
          module.exports.errorHandler(e)
      } else {
        K.emitter.emit('error', e)
      }
    }
    K.blocktotal += 1
    if (fn instanceof Promise) {
      K.total += 1
      return fn.catch(onErr).then(() => {
        K.at += 1
        K.blockat += 1
        K.check()
      })
    }

    let once = false
    return function () {
      K.total += 1
      let x = null
      if (fn) {
        try {
          x = fn.apply(this, arguments)
        } catch (e) {
          onErr(e)
        }
      }
      K.at += 1
      if (!once) {
        once = true
        K.blockat += 1
      }
      K.check()
      return x
    }
  } 

  K.blocktotal = 0
  K.blockat = 0
  K.total = 0
  K.at = 0
  K.ready = false
  K.progress = progress
  K.progressTimer = null
  K.emitter = new EventEmitter()

  let events = ['on', 'once']
  events.map(ename => {
    K[ename] = function() {
      K.emitter[ename].apply(K.emitter, arguments)
    }
  })

  K.errorFirst = function (fn) {
    return K(function () {
      let args = Array.prototype.slice.call(arguments)
      let err = args.shift()
      if (err instanceof Error)
        throw err
      return (fn ? fn.apply(this, args) : null)
    })
  }

  K.check = function () {
    if (K.ready) {
      if (K.blockat == K.blocktotal) {
        K.ready = false
        clearInterval(K.progressTimer)
        K.emitter.emit('end')
      }
      if (!K.progress) {
        K.emitter.emit('progress')
      }
    }
  }

  K.go = function (fn = null) {
    K.ready = true
    if (K.progress) {
      K.progressTimer = setInterval(() => {
        K.emitter.emit('progress')
      }, K.progress)
    }
    if (fn) {
      K.emitter.on('end', fn)
    }
    K.check()
    return K
  }

  return K
}

module.exports.emitter = new EventEmitter()
