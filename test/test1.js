var assert = require('chai').assert;
var should = require('chai').should();
var expect = require('chai').expect;
var pedding = require('pedding');
var EventProxy = require('./cia.js').EventProxy;
console.log(EventProxy)
var __filename = 'mock_file.txt';
var __content = 'Foo bar baz'
var fs = {
  readFile: function (filename, encode, callback) {
    if (typeof encode === 'function') {
      callback = encode;
      encode = null;
    }
    setTimeout(function () {
      if (filename === 'not exist file') {
        return callback(new Error('ENOENT, open \'not exist file\''));
      }
      callback(null, __content);
    }, 10);
  }
};
function step1(callback){
  callback()
}
function step2(callback){
  callback()
}
function step3(callback){
  if(callback)
    callback() 
}
describe("cia", function () {
  it('done(event)', function (done) {
    var ep = new EventProxy 
    ep.bind('event1', function (data) {
      should.exist(data);
      expect(data).to.equal(__content)
      done();
    });
    ep.bind('error', done);
    fs.readFile(__filename, ep.done('event1'));
  });
  it('loaded', function (done) {
    var ep = new EventProxy 
    ep.bind('loaded', function (data) {
      should.exist(data);
      expect(data).to.equal(__content)
      done();
    });
    ep.bind('error', done);
    fs.readFile(__filename, ep.done('loaded'));
  });
  it('step', function (done) {
    step1(function(){
      step2(function(){
        step3()
        done();
      })
    })
    
  });
  it('step2', function (done) {
    var ep = new EventProxy 
    ep.bind('s1', function () {            
      step2(ep.done("s2"))       
    });
    ep.bind('s2', function () {            
      step3(ep.done("s3"))          
    });
    ep.bind('s3', function () {            
      done()
    });
    step1(ep.done("s1"))
  });
})