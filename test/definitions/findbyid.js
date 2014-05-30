/**
 * Created by Dominic Böttger on 11.05.2014
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
var definition = function () {
  this.name = 'findById';
  this.query = function (params) {
    return {
      'from': 0,
      'size': 1,
      'filter': {
        'term': {
          '_id': params._id
        }
      }
    };
  };
  return this;
};

var init = function () {
  return new definition();
};

module.exports = init;