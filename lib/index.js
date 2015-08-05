var EntryList = require("./EntryList")
  , TypeList = require("./TypeList");

function Launcher(){
  this.entries = new EntryList();
  this.types = new TypeList();
}
