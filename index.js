// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var SoapGenerator = require('./lib/codegen/generator-soap');
var generateModels = require('./lib/codegen/json-schema');


function getGenerator() {
  var generator = new SoapGenerator();
  return generator;
}

/**
 * Generate remote methods from soap spec
 * @param {Object} spec
 * @param {Object} options
 * @returns {String}
 */
exports.generateRemoteMethods = function(spec, options) {
  return getGenerator(spec).generateRemoteMethods(spec, options);
};

/**
 * Generate remote methods for an array of operations
 * @param {String|Number} version
 * @param {String} modelName
 * @param {BaseOperation[]} operations
 * @returns {String}
 */
exports.generateCode = function(version, modelName, operations) {
  return getGenerator(spec).generateCodeForOperations(modelName, operations);
};

/**
 * Generate model definitions
 * @param {Object} spec soap spec
 * @param {Object} options
 * @returns {Object}
 */
exports.generateModels = function(wsdl, operations, options) {
  return getGenerator().generateModels(wsdl, operations);
};

exports.getGenerator = getGenerator;


