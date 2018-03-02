//TEST FRAMEWORKS
const chai = require('chai')
    , cap = require('chai-as-promised')
    , path = require("path");
chai.config.includeStack = true;

process.env["XDG_DATA_DIRS"] = path.resolve(__dirname,"..","fixtures");


//server.start(server.app);
chai.use(cap);
global.expect = chai.expect;
global.should = chai.should();
