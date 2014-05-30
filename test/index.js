/**
 * Created by Dominic Böttger on 11.05.2014
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
var should = require('should'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  mlcl_database = require('mlcl_database'),
  mlcl_elastic = require('mlcl_elastic'),
  assert = require('assert'),
  mlcl_elements = require('mlcl_elements'),
  async = require('async'),
  mlcl_collections = require('../');

describe('mlcl_elastic', function() {
  var mlcl;
  var molecuel;
  var mongo;
  var elastic;
  var elements;
  var collections;

  before(function(done) {
    // init fake molecuel
    mlcl = function() {
      return this;
    };
    util.inherits(mlcl, EventEmitter);
    molecuel = new mlcl();

    molecuel.config = { };
    molecuel.config.search = {
      host: 'localhost',
      port: '9200',
      prefix: 'mlcl-collections-unit'
    };

    molecuel.config.database = {
      type: 'mongodb',
      uri: 'mongodb://localhost/mlcl-collections-unit'
    };

    molecuel.config.elements = {
      schemaDir: __dirname + '/schemas'
    };

    molecuel.config.collections = {
      collectionDir: __dirname + '/definitions'
    };

    collections = mlcl_collections(molecuel);
    mongo = mlcl_database(molecuel);
    elastic = mlcl_elastic(molecuel);
    elements = mlcl_elements(molecuel);
    done();
  });

  describe('collections', function() {
    var elements;
    var collections;
    var pagemodel;
    var testpage1;

    it('should initialize collections module', function(done) {
      molecuel.once('mlcl::collections::init:post', function(coll) {
        collections = coll;
        elements = coll.elements;
        collections.should.be.a.object;
        done();
      });
      molecuel.emit('mlcl::core::init:post', molecuel);
    });

    it('should have registered the collections', function(done) {
      collections.collectionRegistry.should.exists;
      collections.collectionRegistry.should.be.a.object;
      collections.collectionRegistry.findById.should.be.a.object;
      done();
    });

    it('should return the registered page model', function(done) {
      pagemodel = elements.getModel('page');
      pagemodel.should.be.a.object;
      done();
    });

    it('should save a object to database', function(done) {
      var mypage = new pagemodel();
      mypage.url = '/test_my_url';
      mypage.lang = 'en';
      mypage.title = 'This is a testpage';
      mypage.save(function(err) {
        should.not.exist(err);
        testpage1 = mypage;
        done();
      });
    });

    it('should wait for saved objects be refreshed in index', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });

    var collectionQueryObject;

    it('should create a query object', function(done) {
      collectionQueryObject = collections.query('findById', testpage1);
      collectionQueryObject.should.be.a.object;
      done();
    });

    it('findById should return a result', function(done) {
      collectionQueryObject.exec(function(error, result) {
        should.not.exists(error);
        result.should.be.a.object;
        should.exists(result.hits.hits[0]);
        result.hits.hits[0].should.be.a.object;
        done();
      });
    });

    it('should save a lot of objects to database', function(done) {
      var count = 0;
      async.whilst(
        function () { return count < 50; },
        function (callback) {
          var mypage = new pagemodel();
          mypage.lang = 'en';
          mypage.title = 'This is a testpage';
          mypage.save(function(err) {
            count++;
            should.not.exist(err);
            testpage1 = mypage;
            callback();
          });
        },
        function (err) {
          should.not.exists(err);
          done();
        }
      );
    });

    it('should wait for saved objects be refreshed in index', function(done) {
      setTimeout(function() {
        done();
      }, 1000);
    });

    it('should create a query object', function(done) {
      collectionQueryObject = collections.query('findbytype', {type: 'page'});
      collectionQueryObject.should.be.a.object;
      done();
    });

    it('findByType should return a lot of results', function(done) {
      collectionQueryObject.exec(function(error, result) {
        should.not.exists(error);
        result.should.be.a.object;
        should.exists(result.hits.hits[0]);
        assert(result.hits.total === 51);
        result.hits.hits[0].should.be.a.object;
        done();
      });
    });

    after(function(done) {
      elements.database.database.connection.db.dropDatabase(function(error) {
        should.not.exists(error);
        elements.elastic.deleteIndex('*', function(error) {
          should.not.exists(error);
          done();
        });
      });
    });
  });
});
