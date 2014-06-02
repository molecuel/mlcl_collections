/**
 * Created by Dominic Böttger on 28.05.2014
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
var _ = require('underscore');
var fs = require('fs');
var collquery = require ('./lib/query');
//var async = require('async');

var molecuel;

/**
 * This module serves the molecuel elements the type definition for database objects
 * @todo implement the dynamic generation of elements
 * @constructor
 */
var collections = function () {
  var self = this;

  this.collectionRegistry = {};
  // emit molecuel elements pre init event
  molecuel.emit('mlcl::collections::init:pre', self);

  /**
   * Schema directory config
   */
  if (molecuel.config.collections && molecuel.config.collections.collectionDir) {
    this.collectionDir = molecuel.config.collections.collectionDir;
  }

  /**
   * Execute after successful elasticsearch connection
   */
  molecuel.on('mlcl::elements::init:post', function (elements) {
    // add the access to all the db's and searchfunctionality
    self.elements = elements;
    self.elastic = elements.elastic;
    self.database = elements.database;
    self.registerCollections();
    molecuel.emit('mlcl::collections::init:post', self);
  });
  return this;
};


/* ************************************************************************
 SINGLETON CLASS DEFINITION
 ************************************************************************ */
var instance = null;

/**
 * Singleton getInstance definition
 * @return singleton class
 */
var getInstance = function () {
  if (instance === null) {
    instance = new collections();
  }
  return instance;
};

/**
 * Load the definitions
 * @todo load from configuration
 */
collections.prototype.registerCollections = function registerCollections() {
  molecuel.emit('mlcl::collections::preGetDefinitions', this);
  var self = this;

  /**
   * Load collection definitions
   * @type {*}
   */
  var defFiles = fs.readdirSync(this.collectionDir);
  defFiles.forEach(function (entry) {
    var currentCollection = require(self.collectionDir + '/' + entry)();
    self.registerCollection(currentCollection);
  });
  molecuel.emit('mlcl::collections::postGetDefinitions', this);
};

/**
 * Register the collections
 * @param collection
 */
collections.prototype.registerCollection = function registerCollection(collection) {
  this.collectionRegistry[collection.name] = collection;
};

/**
 * Return the definition of the collection query
 * @param name
 * @returns {*}
 */
collections.prototype.getCollection = function getCollection(name) {
  var collection = getInstance();
  return collection.collectionRegistry[name];
};

/**
 * Query the collections
 * @param name
 * @param options
 * @param callback
 */
collections.prototype.query = function query(name, options) {
  var currentQuery = new collquery(this.elastic, new this.getCollection(name), options);
  return currentQuery;
};

collections.prototype.exec = function exec(name, options, callback) {
  var self = this;
  var query = self.query(name, options);
  query.exec(function (err, result) {
    if(err) {
      return callback(err);
    }
    return self.processResult(result, callback);
  });
};

collections.prototype.processResult = function(query, result, callback) {
  var r = { total: 0, limit: query.query.limit, from: query.query.from, items: [] };
  r._meta = {
    module: 'collections',
    type: 'collection'
  };

  if (result && result.hits && result.hits.hits && result.hits.hits[0]) {
    r.total = result.hits.total;
    _.each(result.hits.hits, function(hit) {
      var source = hit._source;
      source._meta = {
        module: 'elements',
        type: hit._type
      };
      hit._view = { template: hit._type };
      r.items.push(source);
    });
  }
  return callback(null, r);
};


var init = function (m) {
  // store molecuel instance
  molecuel = m;
  return getInstance();
};

module.exports = init;