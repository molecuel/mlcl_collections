/**
 * Created by Dominic Böttger on 29.05.2014
 * INSPIRATIONlabs GmbH
 * http://www.inspirationlabs.com
 */
var definition = function () {
  this.name = 'findbytype';
  this.query = function (params) {
    return {
      'filter': {
        'term': {
          'type': params.type
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