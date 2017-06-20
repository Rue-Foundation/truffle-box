var path = require("path");
var fs = require("fs-extra");
var assert = require("assert");

var Box = require("../");

var TRUFFLE_BOX_DEFAULT = "git@github.com:trufflesuite/truffle-init-default.git";

describe("Unbox", function() {
  var destination = path.join(__dirname, ".truffle_test_tmp");

  before("mkdir", function(done) {
    fs.ensureDir(destination, done);
  });

  after("remove tmp dir", function(done) {
    fs.remove(destination, done);
  });

  it("unboxes truffle box from github", function() {
    this.timeout(5000);

    return Box.unbox(TRUFFLE_BOX_DEFAULT, destination)
      .then(function (truffleConfig) {
        assert.ok(truffleConfig);

        assert(
          fs.existsSync(path.join(destination, "truffle.js")),
          "Unboxed project should have truffle config."
        );
      });
  });

  it("won't re-init if truffle.js file exists", function(done) {
    this.timeout(5000);

    var contracts_directory = path.join(destination, "contracts");

    // Assert our precondition
    assert(fs.existsSync(contracts_directory), "contracts directory should exist for this test to be meaningful");

    fs.remove(contracts_directory, function(err) {
      if (err) return done(err);

      Box.unbox(TRUFFLE_BOX_DEFAULT, destination)
        .then(function(boxConfig) {
          assert(
            fs.existsSync(contracts_directory) == false,
            "Contracts directory got recreated when it shouldn't have"
          );
          done();
        })
        .catch(function(e) {
          if (e.message.indexOf("A Truffle project already exists at the destination.") >= 0) {
            done();
          } else {
            done(new Error("Unknown error received: " + e.stack));
          }
        });
    });
  });
});
