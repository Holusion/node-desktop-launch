var path = require("path");
describe("utils - getXdgDirs()",function () {
  var getXdgDirs;
  before(function(){
    getXdgDirs = require("../lib/utils/getXdgDirs");
  })
  describe("dataDirs",function(){
    it("returns content of $XDG_DATA_DIRS & $HOME/.local/share",function(){
      var dirs = getXdgDirs("dataDirs");
      expect(dirs.length).to.equal(2);
      expect(dirs[1]).to.equal(path.join(__dirname,"fixtures"));
    });
    it("cat path with first parameter",function(){
      var dirs = getXdgDirs("dataDirs","toto");
      expect(dirs.length).to.equal(2);
      expect(dirs[1]).to.equal(path.join(__dirname,"fixtures/toto"));
    });
  });
});
