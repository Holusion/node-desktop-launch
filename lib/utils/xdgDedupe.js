/**
 * Deduplicate an array of desktop entries list using reduce
 * @param  {Object} obj resulting object
 * @param  {Object} add keys to merge in
 * @return {Object} the merged object
 */
module.exports = function(obj,add){
  if(!add){
    return obj;
  }
  Object.keys(add).forEach(function(key){
    if(!obj[key]){
      obj[key] = add[key]; //TODO : dedupe also desktop ID
    }
  });
  return obj;
}
