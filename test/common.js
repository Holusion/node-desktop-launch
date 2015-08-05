//TEST FRAMEWORKS
var chai = require('chai');
var path = require("path");
chai.config.includeStack = true;

process.env["XDG_DATA_DIRS"] = path.join(__dirname,"fixtures");


//server.start(server.app);
global.expect = chai.expect;
