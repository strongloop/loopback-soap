// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: loopback-soap
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var util = require('util');
var helper = require('../index');
var assert = require('assert');
var soap = require('strong-soap').soap;
var WSDL = soap.WSDL;

describe('Generate APIs and models with WSDLs containing ', function() {
  it('Document/Literal-wrapped with nested complex types', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/stockquote.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var getQuote = wsdl.definitions.bindings.StockQuoteSoap.operations.GetQuote;
        // only one operation in this wsdl. generate API/model for it.
        operations.push(getQuote);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'StockQuoteService',
          'binding': 'StockQuoteBinding',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('StockQuoteServiceStockQuoteBinding.GetQuote = function(GetQuote, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);

        // check for beginning of REST API in generated code
        index = code.indexOf("StockQuoteServiceStockQuoteBinding.remoteMethod('GetQuote',"); // eslint-disable-line max-len
        assert.ok(index > -1);

        // check for utility method that gets JSON value of model at runtime; if available
        index = code.indexOf('function normalize(parameter) {');
        assert.ok(index > -1);

        // check that utility method wraps parameter
        index = code.indexOf('_soapModel.GetQuote(normalize(GetQuote), function (err, response)');// eslint-disable-line max-len
        assert.ok(index > -1);

        // verify generated models against expected
        var expectedModels = readModelJsonSync('stockquote_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it('Schema with ENUM type', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/periodictable.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
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
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('periodictableperiodictableSoap.GetAtomicWeight = function(GetAtomicWeight, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        index = code.indexOf('periodictableperiodictableSoap.GetAtomicNumber = function(GetAtomicNumber, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("periodictableperiodictableSoap.remoteMethod('GetAtomicWeight'"); // eslint-disable-line max-len
        assert.ok(index > -1);
        index = code.indexOf("periodictableperiodictableSoap.remoteMethod('GetAtomicNumber'"); // eslint-disable-line max-len
        assert.ok(index > -1);

        // verify generated models against expected
        var expectedModels = readModelJsonSync('periodictable_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it('RPC/Literal', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/rpc_literal_test.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var myMethod =
              wsdl.definitions.bindings.RPCLiteralTestBinding.operations.myMethod;
        operations.push(myMethod);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'RPCLiteralService',
          'binding': 'RPCLiteralTestBinding',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('RPCLiteralServiceRPCLiteralTestBinding.myMethod = function(myMethod, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("RPCLiteralServiceRPCLiteralTestBinding.remoteMethod('myMethod',"); // eslint-disable-line max-len
        assert.ok(index > -1);

        var expectedModels = path.resolve(__dirname, './results/rpc_literal_model.json');
        expectedModels = require(expectedModels);
        // verify generated models against expected
        assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

        done();
      });
  });

  it('Document/Literal with Nested ElementRef', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/elementref/foo.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var myMethod = wsdl.definitions.bindings.foo_Binding.operations.fooOp;
        operations.push(myMethod);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'foo',
          'binding': 'foo_Binding',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('foofoo_Binding.fooOp = function(fooRq, callback)');
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("foofoo_Binding.remoteMethod('fooOp',");
        assert.ok(index > -1);

        // verify generated models against expected
        var expectedModels = readModelJsonSync('foo_model_nested_ref.json');
        expect(generatedModels).to.deep.equal(expectedModels);

        done();
      });
  });

  it('Document/Literal-wrapped with Recursive schema/XSD', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/recursive/file.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation = wsdl.definitions.bindings.DummyBinding.operations.Dummy;
        operations.push(operation);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'DummyService',
          'binding': 'DummyBinding',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('DummyServiceDummyBinding.Dummy = function(DummyRequest, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("DummyServiceDummyBinding.remoteMethod('Dummy'");
        assert.ok(index > -1);

        // verify generated models against expected
        var expectedModels = readModelJsonSync('recursive_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it('One-way', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/one-way.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation = wsdl.definitions.bindings.OneWayBinding.operations.OneWay;
        operations.push(operation);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'OneWayService',
          'binding': 'OneWayBinding',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('OneWayServiceOneWayBinding.OneWay = function(OneWayRequest, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("OneWayServiceOneWayBinding.remoteMethod('OneWay',");
        assert.ok(index > -1);

        // verify generated models against expected
        var expectedModels = readModelJsonSync('oneway_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it("Response with 'Any' type", function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/uszip.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation = wsdl.definitions.bindings.USZipSoap12.operations.GetInfoByAreaCode; // eslint-disable-line max-len
        operations.push(operation);
        operation = wsdl.definitions.bindings.USZipSoap12.operations.GetInfoByCity; // eslint-disable-line max-len
        operations.push(operation);
        operation = wsdl.definitions.bindings.USZipSoap12.operations.GetInfoByState; // eslint-disable-line max-len
        operations.push(operation);
        operation = wsdl.definitions.bindings.USZipSoap12.operations.GetInfoByZIP; // eslint-disable-line max-len
        operations.push(operation);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'USZip',
          'binding': 'USZipSoap12',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);

        // TODO [rashmi] Revisit. Currently strong-soap returns xs:any type as 0 element which results in empty properties {} list in the model.
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('USZipUSZipSoap12.GetInfoByAreaCode = function(GetInfoByAreaCode, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf('USZipUSZipSoap12.GetInfoByState = function(GetInfoByState, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);

        // check for beginning of REST API in generated code
        index = code.indexOf("USZipUSZipSoap12.remoteMethod('GetInfoByState',");
        assert.ok(index > -1);

        // check for beginning of REST API in generated code
        index = code.indexOf("type: 'GetInfoByState'");
        assert.ok(index > -1);

        var expectedModels = readModelJsonSync('anytype_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);

        done();
      });
  });

  it('Operation Name has a number and property has numeric type', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = 'http://ws.cdyne.com/psaddress/addresslookup.asmx?wsdl';

    WSDL.open(url, options,
      function(err, wsdl) {
        var operation = wsdl.definitions.bindings.AddressLookupSoap.operations.CheckAddressW2lines; // eslint-disable-line max-len
        operations.push(operation);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'AddressLookup',
          'binding': 'AddressLookupSoap',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);
        var generatedModels = helper.generateModels(wsdl, operations);

        // check for API/operation signature in generated code
        var index = code.indexOf('AddressLookupSoap.CheckAddressW2lines = function(CheckAddressW2lines, callback)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        // check for beginning of REST API in generated code
        index = code.indexOf("AddressLookupSoap.remoteMethod('CheckAddressW2lines',");
        assert.ok(index > -1);
        var expectedModels = readModelJsonSync('opname_withnumber_model.json');
        expect(generatedModels).to.deep.equal(expectedModels);

        done();
      });
  });
  it('DataSource checks', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = 'http://ws.cdyne.com/psaddress/addresslookup.asmx?wsdl';

    WSDL.open(url, options,
      function(err, wsdl) {
        var operation = wsdl.definitions.bindings.AddressLookupSoap.operations.CheckAddressW2lines; // eslint-disable-line max-len
        operations.push(operation);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'AddressLookup',
          'binding': 'AddressLookupSoap',
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);

        // check datasource related code from soap connector
        var index = code.indexOf('var soapDataSource = server.datasources.soapDS;'); // eslint-disable-line max-len
        assert.ok(index > -1);
        index = code.indexOf("soapDataSource.once('connected', function ()");
        assert.ok(index > -1);
        index = code.indexOf('_soapModel.CheckAddressW2lines(normalize(CheckAddressW2lines), function (err, response)'); // eslint-disable-line max-len
        assert.ok(index > -1);
        done();
      });
  });

  it('Special character in binding or service name', function(done) {
    var options = {};
    var operations = [];
    var loadedWsdl;
    var url = './wsdls/special_char_test.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var bindings = wsdl.definitions.bindings;
        var myMethod =
                bindings["-a.b/c`d~e!f@g#h%i^j*k(l)m-n+o=p'q+r;s<t>u,v?w/x"].operations.myMethod;
        operations.push(myMethod);
        loadedWsdl = wsdl;
        var apiData = {
          // assumes SOAP WebService datasource with name 'soapDS' exists
          'datasource': 'soapDS',
          'wsdl': wsdl,
          'wsdlUrl': url,
          'service': 'RPCLiteralService',
          'binding': "-a.b/c`d~e!f@g#h%i^j*k(l)m-n+o=p'q+r;s<t>u,v?w/x",
          'operations': operations,
        };

        var code = helper.generateRemoteMethods(apiData);

        // check variable name for the model is created correctly by substituting any special characters not acceptable in javascript variable with _
        var index = code.indexOf('RPCLiteralService_a_b_c_d_e_f_g_h_i_j_k_l_m_n_o_p_q_r_s_t_u_v_w_x'); // eslint-disable-line max-len
        assert.ok(index > -1);

        done();
      });
  });

  it('RPC/Literal WSDL using complex types', function(done) {
    var options = {};
    var operations = [];
    var url = './wsdls/stockquoterpc.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation =
          wsdl.definitions.bindings.StockQuoteSoapBindingRPC.operations.setLastTradePrice;
        operations.push(operation);

        var generatedModels = helper.generateModels(wsdl, operations);

        var expectedModels = path.resolve(__dirname, './results/stockquoterpc_model.json');
        expectedModels = require(expectedModels);
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it('Test GetCase WSDL to avoid regressions', function(done) {
    var options = {};
    var operations = [];
    var url = './wsdls/GetCase.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation =
          wsdl.definitions.bindings.soap.operations.GetCase;
        operations.push(operation);

        var generatedModels = helper.generateModels(wsdl, operations);

        var expectedModels = path.resolve(__dirname, './results/getcase_model.json');
        expectedModels = require(expectedModels);
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });

  it('Test complexReferences WSDL to avoid going into a loop', function(done) {
    /*
     * This tests covers the scenario where a chain of objects end up making a reference to a parent
     * e.g. APIObject -> UserAccess -> Owner -> AccountUser -> UserAccess
     */
    var options = {};
    var operations = [];
    var url = './wsdls/complexReferences.wsdl';

    WSDL.open(path.resolve(__dirname, url), options,
      function(err, wsdl) {
        var operation =
          wsdl.definitions.bindings.SoapBinding.operations.Retrieve;
        operations.push(operation);

        var generatedModels = helper.generateModels(wsdl, operations);

        var expectedModels = path.resolve(__dirname, './results/complexRef_model.json');
        expectedModels = require(expectedModels);
        expect(generatedModels).to.deep.equal(expectedModels);
        done();
      });
  });
});

function readModelJsonSync(name) {
  var modelJson = path.resolve(__dirname, 'results',  name);
  return JSON.parse(fs.readFileSync(modelJson));
}
