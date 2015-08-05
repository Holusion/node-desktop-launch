var path = require("path");
describe("utils - getDataDirs()",function () {
  var getDataDirs;
  before(function(){
    getDataDirs = require("../lib/utils/getDataDirs");
  })
  it("returns content of $XDG_DATA_DIRS & $HOME/.local/share",function(){
    var dirs = getDataDirs();
    expect(dirs.length).to.equal(2);
    expect(dirs[1]).to.equal(path.join(__dirname,"fixtures"));
  });
  it("cat path with first parameter",function(){
    var dirs = getDataDirs("toto");
    expect(dirs.length).to.equal(2);
    expect(dirs[1]).to.equal(path.join(__dirname,"fixtures/toto"));
  });
});
