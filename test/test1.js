var assert = require('chai').assert;
var should = require('chai').should();
var expect = require('chai').expect;
var pedding = require('pedding');
var EventProxy = require('./cia.js').EventProxy;

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
  it('fooargs', function (done) {
    // 函数参数的声明真的是不重要的，不过是给用户的语法糖
    var foo = function(err ,data){
      var args = Array.prototype.slice.call(arguments, 1);
      expect(args).to.deep.equal([1,2,3])
    }
    var foo1 = function(){
      var args = Array.prototype.slice.call(arguments, 1);
      expect(args).to.deep.equal([1,2,3])
    }
    foo("error",1,2,3)
    foo1("error",1,2,3)
    done()    
  });
  it('errorargs', function (done) {
      var fs1 = {
        readFile: function (filename, encode, callback) {
          if (typeof encode === 'function') {
            callback = encode;
            encode = null;
          }
          setTimeout(function () {
            if (filename === 'not exist file') {              
              return callback(new Error('ENOENT, open \'not exist file\''),1,2,3);
            }
            callback(null, __content);
          }, 10);
        }
      };
    var ep = new EventProxy ;
    ep.bind("error",function(){
      expect(Array.prototype.slice.call(arguments,1)).to.deep.equal([1,2,3])
      done()    
    })
    fs1.readFile("not exist file",ep.done("e1"))
    
  });
    it('errorargs', function (done) {
    var ep = new EventProxy ;
    ep.bind("e1",function(data){
      expect(data).to.deep.equal(__content)
      done()    
    })
    fs.readFile(__filename,ep.done("e1"))    
  });
  it('arrayslice', function (done) {
    function foo(a,b,c){
      expect(Array.prototype.slice.call(arguments,1)).to.deep.equal([2,3])
      expect(Array.prototype.slice     (arguments,1)).to.deep.equal([])
      done();
    }
    foo(1,2,3)
  });
   it('foo2', function (done) {
    function foo(a,b,c){
      // 不会调用到此
      expect(0).to.equal(1)      
    }
    function foo(a,b){
      expect(arguments.length).to.equal(3)
      done();
    }
    foo(1,2,3)    
  });
})