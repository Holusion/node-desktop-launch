'use strict';
const EventEmitter = require("events").EventEmitter;

class ExecMock extends EventEmitter{
  constructor(args){
    super();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
    process.nextTick(()=>{
      this.stdout.emit("data","hello");
      this.stderr.emit("data","world");
      process.nextTick(this.emit.bind(this,"exit",args));
    })
  }

}
module.exports = ExecMock;
