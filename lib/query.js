/**
 * Created by Dominic Böttger on 30.05.14.
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
var query = function(elastic, collectionDefinition, params) {
  this.elastic = elastic;
  this.params = params;
  this.setQuery(collectionDefinition.query);
  return this;
};

query.prototype.setQuery = function setQuery(query) {
  this.query = query(this.params);
  return this;
};

query.prototype.setLimit = function setLimit(limit) {
  return this.setSize(limit);
};

query.prototype.setSize = function setSize(size) {
  if(this.query) {
    this.query.size = parseInt(size);
  }
  return this;
};

query.prototype.setFrom = function setLimit(from) {
  if(this.query) {
    this.query.from = from;
  }
  return this;
};

query.prototype.registerPreprocessor = function registerPreprocessor(func) {
  this.preprocess = func;
};

query.prototype.exec = function exec(callback) {
  var self = this;
  this.elastic.search(this.query, function(err, result) {
    if(!err) {
      if(self.preprocess) {
        self.preprocess(result, callback);
      } else {
        callback(err, result);
      }
    } else {
      callback(err);
    }
  });
};

module.exports = query;