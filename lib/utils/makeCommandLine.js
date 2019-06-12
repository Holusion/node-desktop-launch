'use strict';
const path = require("path");
const {URL} = require("url");
const {parse} = require("shell-quote");

module.exports = function(files,line){
  if(!line){
    if(typeof files === "string"){
      return {exec:files,params:[]}
    }else{
      throw new Error("invalid execute request : "+files);
    }
  }
  var argv = parse(line);
  var exec = argv.shift();
  var params = [];
  var has_files = false;
  files = ((Array.isArray(files))?files : [files]);
  function do_push_files(files){
    if(has_files) return;
    Array.prototype.push.apply(params, files);
    has_files= true;
  }
  argv.forEach(function(arg){

    switch(arg){
      case "%f":
          do_push_files(files.slice(0,1));
        break;
      case "%F":
          do_push_files(files);
        break;
      case "%u":
        const uri = new URL(files[0], "file:///");
        do_push_files([uri.toString()]);
        break;
      case "%U":
          do_push_files(params,files.map(function(file){
          const uri = new URL(files[0], "file:///");
          return uri.toString();
        }));
        break;
      case "%i":
      case "%c":
      case "%k":
        //unsupported yet but know args
        break;
      default:
        //this arg is not a special flag but a regular argument
        //The spec advises to ignore unknown args completely
        if (! /^%[^%]/.test(arg)){
          params.push(arg);
        }
        break;
    }
  });
  return {exec:exec,params:params};
}
