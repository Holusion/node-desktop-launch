var Launcher = require("../lib");
var ExecMock = require("./ExecMock");
describe("Launcher",function(){
  describe(".exec",function(){
    beforeEach(function(){
      this.launcher = new Launcher();
      this.launcher._spawn = function(a,b,c){
        return new ExecMock([a,b,c]);
      }
    });
    it("Pipe child.stdout and child.stderr",function(done){
      msgs = 0;
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
