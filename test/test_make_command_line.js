describe("makeCommandLine",function(){
  var make = require("../lib/utils/makeCommandLine");
  describe("parse paths",function(){
    it("relative path to file",function(){
      expect(make("path/to/file", "foo %f")).to.deep.equal({exec:"foo", params:["path/to/file"]});
    })
    it("absolute path to file",function(){
      expect(make("/path/to/file", "foo %f")).to.deep.equal({exec:"foo", params:["/path/to/file"]});
    })
    it("array of absolute file paths",function(){
      expect(make(["/path/to/file", "/path/to/file2"], "foo %F")).to.deep.equal({exec:"foo", params:["/path/to/file", "/path/to/file2"]});
    })
    
    it("relative path to URL",function(){
      expect(make("path/to/file", "foo %u")).to.deep.equal({exec:"foo", params:["file:///path/to/file"]});
    })
    it("absolute path to URL",function(){
      expect(make("/path/to/file", "foo %u")).to.deep.equal({exec:"foo", params:["file:///path/to/file"]});
    })
    it("array of paths to URLs",function(){
      expect(make("/path/to/file", "foo %U")).to.deep.equal({exec:"foo", params:["file:///path/to/file"]});
      expect(make(["/path/to/file", "/path/to/file2"], "foo %U")).to.deep.equal({exec:"foo", params:["file:///path/to/file", "file:///path/to/file2"]});
    })

    it("URL with custom protocol", function(){
      expect(make("foo:///path/to/file", "foo %u")).to.deep.equal({exec:"foo", params:["foo:///path/to/file"]})
    })
    it("URL with custom protocol and hostname", function(){
      expect(make("http://holusion.com/path/to/file", "foo %u")).to.deep.equal({exec:"foo", params:["http://holusion.com/path/to/file"]})
    })
  })
  describe("escape args",function(){
    it("keep spaces in args",function(){
      expect(make("test with spaces","foo %F")).to.deep.equal({exec:"foo",params: ["test with spaces"]});
    });

    it("accepts escaped entries",function(){
      expect(make("file.txt", `foo "something escaped" %u`)).to.deep.equal({exec:"foo",params: ["something escaped","file:///file.txt"]})
    })
    it("keep pre-defined args",function(){
      expect(make("file.txt","foo --bar %F")).to.deep.equal({exec:"foo",params: ["--bar", "file.txt"]});
    });
    it("remove deprecated options",function(){
      expect(make("file.txt", "foo %n %m %u")).to.deep.equal({exec:"foo",params: ["file:///file.txt"]})
    })
    it("remove trailing %f, %u... options",function(){
      expect(make("file.txt", "foo %f %U %u")).to.deep.equal({exec:"foo",params: ["file.txt"]})
    })
    it("escapes characters",function(){
      expect(make(`file_with".txt`, "foo %f %U %u")).to.deep.equal({exec:"foo",params: [`file_with".txt`]})
    })
  })
});
