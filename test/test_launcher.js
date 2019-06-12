'use strict';
const path = require("path");

const {Launcher} = require("../lib");
const ExecMock = require("./ExecMock");

const delay = (d) => new Promise((r)=> setTimeout(r,d));

describe("Launcher",function(){
  describe("start()",function(){
    let launcher;
    beforeEach(function(){
      launcher =  new Launcher();
    });

    afterEach(function(){
      launcher.close();
    })

    it("open with desktop handler",function(done){
      launcher.exec = function(file, line, opts){
        expect(file).to.equal("/path/to/file.txt");
        expect(line).to.equal("foo %f");
        done();
      }
      launcher.start("/path/to/file.txt")
    });
    
    it("open as binary",function(done){
      launcher.exec = function(file, line, opts){
        expect(file).to.equal("/path/to/file");
        expect(line).to.be.null;
        done();
      }
      launcher.start("/path/to/file")
    });
    it("open as DBus",function(done){
      launcher.exec = function(){
        done(new Error("Exec should not be called in this case"));
      }
      launcher.openDbus = function(file, id){
        expect(file).to.equal("/path/to/file.bar");
        expect(id).to.equal("bar.desktop");
        done();
      }
      launcher.start("/path/to/file.bar");
    });
    it("open URI schemes",function(done){
      launcher.exec = function(file, line, opts){
        expect(file).to.equal("foo:///path/to/file");
        expect(line).to.equal("foo %f");
        done();
      }
      launcher.start("foo:///path/to/file")
    });
  })

  describe("exec()",function(){

    describe("mocked",function(){
      let launcher;
      beforeEach(function(){
        launcher = new Launcher();
        launcher._spawn = function(a,b,c){
          return new ExecMock([a,b,c]);
        }
      });
      afterEach(function(){
        launcher.close();
      })
      it("Pipe child.stdout and child.stderr",function(done){
        let msgs = 0;
        launcher.on("stdout",function(l){
          expect(l).to.equal("hello");
          msgs++;
        })
        launcher.on("stderr",function(l){
          expect(l).to.equal("world");
          msgs++;
        })
        launcher.on("end",function(){
          expect(msgs).to.equal(2);
          done()
        })
        var res = launcher.exec("arg1","arg2");
      });
      it("takes spawn options from 3rd arg",function(done){
        launcher._spawn = function(command,args,options){
          expect(options).to.deep.equal({env:{NODE_ENV:"development"}});
          done();
          return new ExecMock([command,args,options]);
        }
        launcher.exec("1","sleep %f",{env:{NODE_ENV:"development"}});
      });
    });
    describe("Spawn and kill childs",function(){
      let launcher;
      beforeEach(function(){
        launcher = new Launcher();
      });
      afterEach(function(){
        launcher.close();
      })
      it("parse app launchers",function(){
        let child = launcher.exec("1","sleep %f");
        expect(child).to.be.not.null;
        expect(process.kill(child.pid),0).to.be.true;
      });
      it("parse binary file execution",function(){
        let child = launcher.exec(path.resolve(__dirname,"fixtures/stubFile.sh"));
        expect(child).to.be.not.null;
      });
      it("Emit end on child exit",function(done){
        launcher.on("end",function(){
          done();
        })
        launcher.exec("0.01", "sleep %f");
      })
      it("Doesn't emit end when child is replaced",async function(){
        launcher.on("end",function(){
          expect.fail("end event should not fire for early-killed child");
        })
        for (let i=0;i <20; i++){
          launcher.exec("2", "sleep %f");
          await delay(10);
        }
        launcher.killChild();
      })
    });
  })
})
