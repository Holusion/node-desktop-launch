'use strict';
const path = require("path");
const {URL} = require("url");
const {parse} = require("shell-quote");

function encodePath(file){
  return file.split("/").map(p => encodeURIComponent(p)).join("/");
}

module.exports = function makeCommandLine(files,line){
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
    params.push(...files);
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
        try{
          const uri = new URL(files[0]);
          do_push_files([uri.toString()]);
        }catch(e){
          //Only known error to URL is when input is not a valid absolute URL
          do_push_files([files[0]]);
        }
        

        break;
      case "%U":
        do_push_files(files.map(function(file){
          const uri = new URL(file, "file:");
          try{
            const uri = new URL(files[0]);
            return uri.toString();
          }catch(e){
            return file;
          }
        }));
        break;
      case "%i":
      case "%c":
      case "%k":
        //unsupported yet but known args
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
