// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var ejs = require('ejs');
var util = require('util');
var _cloneDeep = require('lodash').cloneDeep;
var _s = require('underscore.string');
var template = require('./model-template');

// TODO [rashmi] should all these represent 'number' in loopback?
var XML_NUMERIC_TYPES = [
  'int',
  'long',
  'float',
  'double',
  'decimal',
  'short',
  'byte',
  'negativeInteger',
  'nonNegativeInteger',
  'nonPositiveInteger',
  'positiveInteger',
  'short',
  'unsignedLong',
  'unsignedInt',
  'unsignedShort',
  'unsignedByte',
];

function BaseGenerator(options) {
  this.options = options || {};
}

function BaseOperation(op) {
  var copy = _cloneDeep(op || {});
  for (var p in copy) {
    this[p] = copy[p];
  }
}

BaseOperation.prototype.getAccepts = function() {
  if (this.accepts) {
    return this.accepts;
  }

  var accepts = this.parameters.map(mapParameter);
  this.accepts = accepts;
  return this.accepts;
};

BaseOperation.prototype.getRemoting = function() {
  if (this.remoting) {
    return this.remoting;
  }
  var remoting = {isStatic: true};
  if (this.consumes) {
    remoting.consumes = this.consumes;
  }
  if (this.produces) {
    remoting.produces = this.produces;
  }
  remoting.accepts = this.getAccepts();
  remoting.returns = this.getReturns();
  remoting.http = {
    verb: this.verb,
    path: '/' + this.path,
  };
  remoting.description = this.description;
  this.remoting = remoting;
  return this.remoting;
};

BaseOperation.prototype.printRemoting = function() {
  return util.inspect(this.getRemoting(), {depth: null});
};

exports.BaseOperation = BaseOperation;
exports.BaseGenerator = BaseGenerator;

/**
 * Given list of operations from user via loopback-cli/generator-loopback, this method generates Remote methods which
 * gets serialized into a .js file in generator-loopback
 *
 * @param {array} opsInfo The array to iterate over.
 *   var opsInfo = {
    "wsdl": wsdl,
    "wsdlUrl": wsdlUrl,
    "service": selectedService,
    "binding": selectedBinding,
    "operations": selectedOperations[]
  }
 * @param {array} options optional options
 * @returns {string} generated code which has remote methods and REST APIs
 */

BaseGenerator.prototype.generateRemoteMethods = function(opsInfo, options) {
  options = options || {};

  // given the list of operations, get the data in the format needed to generate remote methods and REST/API
  var apiData = getAPIData(opsInfo);

  var operations = getOperations(apiData);
  var operationList = [];
    /* eslint-disable one-var */
  for (var path in operations) {
    for (var verb in operations[path]) {
      var op = operations[path][verb];
      operationList.push(op);
    }
  }
  var modelName = opsInfo.service + opsInfo.binding;
  // modeName is used as variable name in the generated code. Hence need to replace -,.,/ with _
  modelName = normalizeVarName(modelName);
  var code = generateCodeForOperations(modelName, opsInfo.datasource,
    operationList);
  return code;
};

function normalizeVarName(modelName) {
  // since the generated javascript code uses servicename+bindinganme as variable name for created model, if this
  // name contains any special characters not acceptable for javascript variable name, substitute these
  // special characters with _
  return modelName.replace(/[-.\/`~!@#%^&*()-+={}'";:<>,?/]/g, '_');
}

/**
 * Given list of operations from user via loopback-cli/generator-loopback, this method generates models needed for the remote methods
 *
 * @param {wsdl} wsdl object for the given wsdl
 * @param {array} operations list of operations selected by the user
 * @param {array} options optional options
 * @returns {array} generated list of JSON models for the selected operations
 */

BaseGenerator.prototype.generateModels = function(wsdl, operations, options) {
  options = options || {};
  var models = getModels(wsdl, operations);
  return models;
};

// generates code for operations using the model.ejs template
function generateCodeForOperations(modelName, datasource, operations) {
  var code = ejs.render(template,
    {datasource: datasource, modelName: modelName || 'SoapModel',
      operations: operations});
  return code;
};

// get data for generating Remote REST API
function getAPIData(opsInfo) {
  var operations = opsInfo.operations;
  var paths;
  var operationInfo = {};
  for (var name in operations) {
    var operation = operations[name];
    var opDetails =  {
      'post': getOperationInfo(operation, opsInfo.wsdl),
    };
    operationInfo[operation.$name] = opDetails;
    paths = {
      paths: operationInfo,
    };
  }
  return paths;
}

function getOperationInfo(operation, wsdl) {
  var operationInfo = {
    'summary': operation.$name,
    'description': operation.$name,
    'operationId': operation.$name,
    'produces': getProduces(),
    'parameters': getParameters(operation, wsdl),
    'responses': getResponses(operation, wsdl),
  };
  return operationInfo;
}

// get 'produces' part of the REST API
function getProduces() {
  var producesList = [];
  producesList.push({'produces': 'application/json'});
  producesList.push({'produces': 'application/xml'}); // TODO [rashmi] do we need this?
  return producesList;
}

// get 'returns' part of the REST API
function getResponses(operation, wsdl) {
  var responsesList = [];
  if (operation.output == null) {
    return responsesList;
  }
  var operationDescriptor = operation.describe(wsdl.definitions);
  var outputBodyDescriptor = operationDescriptor.output.body;
  var modelName;
  if (outputBodyDescriptor.qname) {
    modelName = outputBodyDescriptor.qname.name;
  }    else { // this could be a case of default namespace in wsdl. Fall back on using input message name.
    modelName = operation.output.message.$name;
  }

  var responses = {
    description: modelName, // TODO [rashmi] use operation name for now. Figure out to get it from schema if defined.
    'type': modelName,
    arg: 'data',
    'required': true,
    root: true,
  };
  responsesList.push(responses);
  return responsesList;
}

// get 'produces' part of the REST API
function getParameters(operation, wsdl) {
  var params = [];
  var operationDescriptor = operation.describe(wsdl.definitions);
  var inputBodyDescriptor = operationDescriptor.input.body;
  var modelName;
  if (inputBodyDescriptor.qname) {
    modelName = inputBodyDescriptor.qname.name;
  }    else { // this may be a case of default namespace. Fall back on using input message name
    modelName = operation.input.message.$name;
  }
  var parameters = {
    'in': 'body',
    'name': modelName,
    'description': modelName, // TODO [rashmi] get description from schema
    'required': true,
    'type': modelName,
  };
  params.push(parameters);
  return params;
}

// get JSON models for operations[]
function getModels(wsdl, operations) {
  var schema = wsdl.definitions.schemas;

  var models = {};
  let complexTypes, simpleTypes;
  const complexTypesDescribe = {};
  for (let uri in schema) {
    complexTypes = schema[uri].complexTypes;
    if (complexTypes) {
      for (let type in complexTypes) {
        complexTypes[type].describeChildren(wsdl.definitions);
        complexTypesDescribe[type] = complexTypes[type].describe(wsdl.definitions);
      }
    }
    simpleTypes = schema[uri].simpleTypes;
  }
  var schemaTypes = {
    complexTypes: complexTypes,
    simpleTypes: simpleTypes,
    complexTypesDescribe: complexTypesDescribe,
  };

  for (let name in operations) {
    var elements = {};
    var op = operations[name];
    var operationDescriptor = op.describe(wsdl.definitions);
    var inputBodyDescriptor = operationDescriptor.input.body;
    var inputMessage;
    var modelName;
    if (inputBodyDescriptor.qname) {
      modelName = inputBodyDescriptor.qname.name;
      inputMessage = op.operation.input.message;
    } else { // this may be a case of default namespace. Fall back on using input message name
      modelName = op.input.message.$name;
    }
    buildElementProperties(models, modelName, {},
      inputBodyDescriptor, schemaTypes, inputMessage);

    if (op.output) { // incase of one-way operation, there is no output
      var outputBodyDescriptor = operationDescriptor.output.body;
      var outputMessage;
      if (outputBodyDescriptor.qname) {
        modelName = outputBodyDescriptor.qname.name;
        outputMessage = op.operation.output.message;
      } else { // this may be a case of default namespace. Fall back on using input message name
        modelName = op.output.message.$name;
      }
      buildElementProperties(models, modelName, {},
        outputBodyDescriptor, schemaTypes, outputMessage);
    }
  }

  return models;
};

// builds properties for input/output params. It recursively builds properties for elements defined in the schema
function buildElementProperties(models, modelName,
                                propertyList, outerElem, schemaTypes, message) {
  models[modelName] = {
    'name': modelName,
    'properties': propertyList,
  };
  var elements = outerElem.elements;
  for (let i in elements) {
    var element = elements[i];
    var type;

    var propertyData;
    var modName;

    if (!element.type && !element.isSimple) {
      modName = element.qname.name;
      buildElementProperties(models, modName, {}, element, schemaTypes, message);
      // check refOriginal since 'type' is returned as 'undefined' if it's referenced in a nested imported schema
      if (element.refOriginal) {
        propertyData = {
          type: checkAndConvertToNumber(element.refOriginal.qname.name),
        };
        propertyList[element.qname.name] = propertyData;
      } else {
        // Check the type of the message part against known complex types and include in models
        if (message) {
          propertyList[modName] = {type: modName};
          if (message.parts[modName] && message.parts[modName].type) {
            const partType = message.parts[modName].type.$name;
            const typeElement = schemaTypes.complexTypesDescribe[partType];
            if (typeElement) {
              buildElementProperties(models,
                modName, {}, typeElement, schemaTypes, message);
            }
          }
        }
      }
      continue;
    }
    // if simpleType, check in simpleTypes list. For e.g Enum could be of simpleType, but not xs: simple type
    if (element.type) {
      if (schemaTypes.simpleTypes && schemaTypes.simpleTypes[element.type.name]) {
        if (schemaTypes.simpleTypes[element.type.name].union) {
          type = schemaTypes.simpleTypes[element.type.name]
                                        .union.children[0].children[0].base.$name;
        } else {
          type = schemaTypes.simpleTypes[element.type.name].children[0].base.$name;
        }
      } else {
        // could be a complextype or xs: simple type
        type = element.type.name;
      }
      propertyData = {
        type: checkAndConvertToNumber(type),
      };
      propertyList[element.qname.name] = propertyData;
    }

    // Code reverted under due to regression
    // For details see PR https://github.com/strongloop/loopback-soap/pull/19
    if (element.elements.length != 0) {
      modName = element.type.name;
      buildElementProperties(models, modName, {}, element, schemaTypes);
    }
  }
  return models;
}

// get operations in a specific format needed for code generation in model.ejs template
function getOperations(spec) {
  var models = spec.definitions;

  var operations = {};

  for (var path in spec.paths) {
    if (path.indexOf('x-') === 0) continue;
    var ops = spec.paths[path];
        /* eslint-disable one-var */
    for (var verb in ops) {
      var op = ops[verb];

      if (!op.parameters) {
        op.parameters = [];
      }

      op.models = models;
      op.verb = verb.toLowerCase();
      op.path = path.replace(/{(([^{}])+)}/g, ':$1');

      var operation = new BaseOperation(op);
      operation.getRemoting();

      operations[operation.path] = operations[operation.path] || {};
      operations[operation.path][operation.verb] = operation;
    }
        /* eslint-enable one-var */
  }
  return operations;
}

// get remote method parameter/s in a specific format needed for code generation in model.ejs template
function mapParameter(p) {
  var type = checkAndConvertToNumber(p.type);

  if (p.type === 'array' && p.items) {
    type = [p.items.type || this.resolveTypeRef(p.items.$ref)];
  }
  if (p.schema && p.schema.$ref) {
    type = this.resolveTypeRef(p.schema.$ref);
  }

  return {
    arg: p.name,
    type: type || 'any',
    description: p.description,
    required: p.required,
    http: {
      source: p.in,
    },
  };
}

// get REST API's returns[]  in a specific format needed for code generation in model.ejs template
BaseOperation.prototype.getReturns = function() {
  if (this.returns) {
    return this.returns;
  }
  var returns = [];
  this.errorTypes = [];
  this.returnType = 'any';
  for (var code in this.responses) {
    var res = this.responses[code];
    returns.push({
      arg: 'data',
      type: res.type || 'any',
      description: res.description,
      root: true,
    });
  }
  this.returns = returns;
  return this.returns;
};

// called during code generation in model.ejs template
function printRequestArgs(op) {
  var requestArgs;
  for (var j = 0; j < op.accepts.length; j++) {
    var param = op.accepts[j];
    if (j != 0) {
      requestArgs = requestArgs + ',';
    }
    requestArgs = param.arg + ': ' + param.arg;
  }
  requestArgs = '{' + requestArgs + '}';
  return requestArgs;
}

// called during code generation in model.ejs template
function printParams(op) {
  var params = [];
  for (var j = 0; j < op.accepts.length; j++) {
    var param = op.accepts[j];
    var type = param.type || '*';
    if (Array.isArray(param.type)) {
      type = param.type[0] + '[]';
    }
    params.push(' * @param {' + type + '} ' + param.arg + ' ' + param.description);
  }

  return params.join('\n');
}

function checkAndConvertToNumber(typeName) {
  if (XML_NUMERIC_TYPES.indexOf(typeName.toLowerCase()) !== -1) {
    return 'number';
  } else {
    return typeName;
  }
};
module.exports = BaseGenerator;
