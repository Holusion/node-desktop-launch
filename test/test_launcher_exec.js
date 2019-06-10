'use strict';
const path = require("path");
const {Launcher} = require("../lib");
var ExecMock = require("./ExecMock");

describe("Launcher.exec()",function(){
  describe("Spawn and kill childs",function(){
    beforeEach(function(){
      this.launcher = new Launcher();
    });
    it("parse app launchers",function(){
      let child = this.launcher.exec("1","sleep %f");
      expect(child).to.be.not.null;
      expect(process.kill(child.pid),0).to.be.true;
    });
    it("parse binary file execution",function(){
      let child = this.launcher.exec(path.resolve(__dirname,"fixtures/stubFile.sh"));
      expect(child).to.be.not.null;
    });
    it("takes spawn options from 3rd arg",function(done){
      this.launcher._spawn = function(command,args,options){
        expect(options).to.deep.equal({env:{NODE_ENV:"development"}});
        done();
        return new ExecMock([command,args,options]);
      }
      this.launcher.exec("1","sleep %f",{env:{NODE_ENV:"development"}});
    });
  });



  describe("parse and setup",function(){
    beforeEach(function(){
      this.launcher = new Launcher();
      this.launcher._spawn = function(a,b,c){
        return new ExecMock([a,b,c]);
      }
    });
    it("Pipe child.stdout and child.stderr",function(done){
      let msgs = 0;
      this.launcher.on("stdout",function(l){
        expect(l).to.equal("hello");
        msgs++;
      })
      this.launcher.on("stderr",function(l){
        expect(l).to.equal("world");
        msgs++;
      })
      this.launcher.on("end",function(){
        expect(msgs).to.equal(2);
        done()
      })
      var res = this.launcher.exec("arg1","arg2");
    });
  });

})
