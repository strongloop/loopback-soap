// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: generator-loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* global describe, beforeEach, it */
'use strict';
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var util = require('util');
var helper = require('../index');
var assert = require('assert')
var soap = require('strong-soap').soap;
var WSDL = soap.WSDL;

describe('Generate APIs and models with WSDLs containing ', function() {

    it('Document/Literal-wrapped with nested complex types', function(done) {
      var options = {};
      var operations = [];
      var loadedWsdl ;
      var url = './wsdls/stockquote.wsdl';

      WSDL.open(path.resolve(__dirname, url), options,
          function (err, wsdl) {
              var getQuote = wsdl.definitions.bindings.StockQuoteSoap.operations.GetQuote;
              //only one operation in this wsdl. generate API/model for it.
              operations.push(getQuote);
              loadedWsdl = wsdl;
              var apiData = {
                  "wsdl": wsdl,
                  "wsdlUrl": url,
                  "service": "StockQuoteService",
                  "binding": "StockQuoteBinding",
                  "operations": operations
              }

              var code = helper.generateRemoteMethods(apiData);
              console.log(code);

              var generatedModels = helper.generateModels(wsdl, operations);
              console.log(util.inspect(generatedModels, { depth: null }));

              //check for API/operation signature in generated code
              var index = code.indexOf("StockQuoteServiceStockQuoteBinding.GetQuote = function(GetQuote, callback)");
              assert.ok(index > -1);
              //check for beginning of REST API in generated code
              index = code.indexOf("StockQuoteServiceStockQuoteBinding.remoteMethod('GetQuote',");
              assert.ok(index > -1);


              var expectedModels = path.resolve(__dirname, './results/stockquote_model.json');
              expectedModels = require(expectedModels);
              //verify generated models against expected
              assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));
              done();
          });
     });

    it('Schema with ENUM type', function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = 'http://www.webservicex.net/periodictable.asmx?WSDL';

        WSDL.open(url, options,
            function (err, wsdl) {
                var getAtomicWeight = wsdl.definitions.bindings.periodictableSoap.operations.GetAtomicWeight;
                var getAtomicNumber = wsdl.definitions.bindings.periodictableSoap.operations.GetAtomicNumber;
                //Pick 2 operations from the wsdl and generate API/model for it.
                operations.push(getAtomicWeight);
                operations.push(getAtomicNumber);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "periodictable",
                    "binding": "periodictableSoap",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }))

                //check for API/operation signature in generated code
                var index = code.indexOf("periodictableperiodictableSoap.GetAtomicWeight = function(GetAtomicWeight, callback)");
                assert.ok(index > -1);
                var index = code.indexOf("periodictableperiodictableSoap.GetAtomicNumber = function(GetAtomicNumber, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("periodictableperiodictableSoap.remoteMethod('GetAtomicWeight'");
                assert.ok(index > -1);
                index = code.indexOf("periodictableperiodictableSoap.remoteMethod('GetAtomicNumber'");
                assert.ok(index > -1);

                var expectedModels = path.resolve(__dirname, './results/periodictable_model.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));
                done();
            });
    });

    // skipping this until a fix made in strong-soap gets into master and published to npm
    it.skip('RPC/Literal', function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = './wsdls/rpc_literal_test.wsdl';

        WSDL.open(path.resolve(__dirname, url), options,
            function (err, wsdl) {
                var myMethod = wsdl.definitions.bindings.RPCLiteralTestBinding.operations.myMethod;
                operations.push(myMethod);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "RPCLiteralService",
                    "binding": "RPCLiteralTestBinding",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }));


                //check for API/operation signature in generated code
                var index = code.indexOf("RPCLiteralServiceRPCLiteralTestBinding.myMethod = function(myMethod, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("RPCLiteralServiceRPCLiteralTestBinding.remoteMethod('myMethod',");
                assert.ok(index > -1)

                var expectedModels = path.resolve(__dirname, './results/rpc_literal_model.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

                done();
            });
    });

    it('Document/Literal with Nested ElementRef', function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = './wsdls/elementref/foo.wsdl';

        WSDL.open(path.resolve(__dirname, url), options,
            function (err, wsdl) {
                var myMethod = wsdl.definitions.bindings.foo_Binding.operations.fooOp;
                operations.push(myMethod);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "foo",
                    "binding": "foo_Binding",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }));

                //check for API/operation signature in generated code
                var index = code.indexOf("foofoo_Binding.fooOp = function(fooRq, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("foofoo_Binding.remoteMethod('fooOp',");
                assert.ok(index > -1);

                var expectedModels = path.resolve(__dirname, './results/foo_model_nested_ref.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

                done();
            });
    });

    it('Document/Literal-wrapped with Recursive schema/XSD', function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = './wsdls/recursive/file.wsdl';

        WSDL.open(path.resolve(__dirname, url), options,
            function (err, wsdl) {
                var operation = wsdl.definitions.bindings.DummyBinding.operations.Dummy;
                operations.push(operation);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "DummyService",
                    "binding": "DummyBinding",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }));

                //check for API/operation signature in generated code
                var index = code.indexOf("DummyServiceDummyBinding.Dummy = function(DummyRequest, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("DummyServiceDummyBinding.remoteMethod('Dummy'");
                assert.ok(index > -1);

                var expectedModels = path.resolve(__dirname, './results/recursive_model.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

                done();
            });
    });

    it('One-way', function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = './wsdls/one-way.wsdl';

        WSDL.open(path.resolve(__dirname, url), options,
            function (err, wsdl) {
                var operation = wsdl.definitions.bindings.OneWayBinding.operations.OneWay;
                operations.push(operation);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "OneWayService",
                    "binding": "OneWayBinding",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }));

                //check for API/operation signature in generated code
                var index = code.indexOf("OneWayServiceOneWayBinding.OneWay = function(OneWayRequest, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("OneWayServiceOneWayBinding.remoteMethod('OneWay',");
                assert.ok(index > -1);

                var expectedModels = path.resolve(__dirname, './results/oneway_model.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

                done();
            });
    });

    it("Response with 'Any' type", function(done) {
        var options = {};
        var operations = [];
        var loadedWsdl ;
        var url = 'http://www.webservicex.net/uszip.asmx?WSDL';

        WSDL.open(url, options,
            function (err, wsdl) {
                var operation = wsdl.definitions.bindings.USZipSoap12.operations.GetInfoByAreaCode;
                operations.push(operation);
                loadedWsdl = wsdl;
                var apiData = {
                    "wsdl": wsdl,
                    "wsdlUrl": url,
                    "service": "USZip",
                    "binding": "USZipSoap12",
                    "operations": operations
                }

                var code = helper.generateRemoteMethods(apiData);
                console.log(code);

                // TODO [rashmi] Revisit. Currently strong-soap returns xs:any type as 0 element which results in empty properties {} list in the model.
                var generatedModels = helper.generateModels(wsdl, operations);
                console.log(util.inspect(generatedModels, { depth: null }));

                //check for API/operation signature in generated code
                var index = code.indexOf("USZipUSZipSoap12.GetInfoByAreaCode = function(GetInfoByAreaCode, callback)");
                assert.ok(index > -1);
                //check for beginning of REST API in generated code
                index = code.indexOf("USZipUSZipSoap12.remoteMethod('GetInfoByAreaCode',");
                assert.ok(index > -1);

                var expectedModels = path.resolve(__dirname, './results/anytype_model.json');
                expectedModels = require(expectedModels);
                //verify generated models against expected
                assert.equal(JSON.stringify(generatedModels), JSON.stringify(expectedModels));

                done();
            });
    });
});
