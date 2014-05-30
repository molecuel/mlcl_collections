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
  if(this.query) {
    this.query.limit = limit;
  }
  return this;
};

query.prototype.setFrom = function setLimit(from) {
  if(this.query) {
    this.query.from = from;
  }
  return this;
};

query.prototype.exec = function exec(callback) {
  this.elastic.search(this.query, callback);
};

module.exports = query;