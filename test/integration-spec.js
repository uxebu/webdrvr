var childProcess = require('child_process');
var path = require('path');
var seleniumRemote = require('selenium-webdriver/remote');
var seleniumWebdriver = require('selenium-webdriver');
var webdrvr = require('../lib/index.js');

describe('bin/webdrvr', function() {

  var webdrvrBin = path.join(__dirname, '..', 'bin', 'webdrvr');

  it('starts a webdriver server on port 59478', function(done) {
    var webdriverProcess = childProcess.spawn(webdrvrBin, ['-port', '59478']);
    webdriverProcess.stderr.on('data', function (data) {
      if (data.toString().indexOf('Started SocketListener on 0.0.0.0:59478') > 0) {
        expect(true).toBe(true);
        webdriverProcess.kill();
        done();
      }
    });
  }, 10000);

});

describe('selenium-webdriver', function() {

  it('executes a google search for "webdriver" with phantomjs using the installed binaries', function(done) {
    var server = new seleniumRemote.SeleniumServer(webdrvr.selenium.path, {
      args: webdrvr.args
    });

    var onError = function(err) {
      console.log('An error occurred ' + err);
      server.stop();
      done();
    };

    server.start(60000).then(function(url) {
      var driver = new seleniumWebdriver.Builder()
        .usingServer(url)
        .withCapabilities(seleniumWebdriver.Capabilities.phantomjs())
        .build();

      driver.get('http://www.google.de');
      var searchBox = driver.findElement(seleniumWebdriver.By.name('q'));
      searchBox.sendKeys('webdriver');
      searchBox.getAttribute('value').then(function(value) {
        expect(value).toBe('webdriver');
        driver.quit().then(function() {
          server.stop();
          done();
        });
      });

    }, onError);
  }, 60000);

});
