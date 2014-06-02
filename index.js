/**
 * Created by Dominic Böttger on 28.05.2014
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
//var _ = require('underscore');
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


collections.prototype.apiGet = function apiGet(req, res, next) {
  var collections = getInstance();
  var collection = collections.getCollection(req.params.name);
  if(collection) {
    var currentQuery = new collquery(collections.elastic, new collections.getCollection(req.params.name), req.query);
    currentQuery.exec(function(err, result) {
      res.locals.api = result;
      next();
    });
  } else {
    next();
  }
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

var init = function (m) {
  // store molecuel instance
  molecuel = m;
  return getInstance();
};

module.exports = init;