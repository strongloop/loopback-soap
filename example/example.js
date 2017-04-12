// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: loopback-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var util = require('util');
var helper = require('../index');
var soap = require('strong-soap').soap;
var WSDL = soap.WSDL;

var options = {};
var operations = [];
var loadedWsdl;
var url = 'http://www.webservicex.net/periodictable.asmx?WSDL';

WSDL.open(url, options,
    function(err, wsdl) {
      var getAtomicWeight =
          wsdl.definitions.bindings.periodictableSoap.operations.GetAtomicWeight;
      var getAtomicNumber =
          wsdl.definitions.bindings.periodictableSoap.operations.GetAtomicNumber;
        // Pick 2 operations from the wsdl and generate API/model for it.
      operations.push(getAtomicWeight);
      operations.push(getAtomicNumber);
      loadedWsdl = wsdl;
      var apiData = {
        // assumes SOAP WebService datasource with name 'soapDS' exists
        'datasource': 'soapDS',
        'wsdl': wsdl,
        'wsdlUrl': url,
        'service': 'periodictable',
        'binding': 'periodictableSoap',
        'operations': operations,
      };

      var code = helper.generateRemoteMethods(apiData);
      console.log(code);

      var generatedModels = helper.generateModels(wsdl, operations);
      console.log(util.inspect(generatedModels, {depth: null}));
    });

