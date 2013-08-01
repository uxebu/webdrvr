var childProcess = require('child_process');
var path = require('path');
var seleniumRemote = require('selenium-webdriver/remote');
var seleniumWebdriver = require('selenium-webdriver');
var webdriver = require('../lib/index.js')(process);

describe('bin/webdriver', function() {
  
  var webdriverBin = path.join(__dirname, '..', 'bin', 'webdriver');

  it('starts a webdriver server on port 59478', function(done) {
    var webdriverProcess = childProcess.spawn(webdriverBin, ['-port', '59478']);
    webdriverProcess.stdout.on('data', function (data) {
      if (data.toString().indexOf('Started SocketListener on 0.0.0.0:59478') > 0) {
        expect(true).toBe(true);
        webdriverProcess.kill();
        done();
      }
    });
  }, 10000);
  
  it('executes a google search for "webdriver" with phantomjs', function(done) {
    var capabilities = {browserName: 'phantomjs'};
    var server = new seleniumRemote.SeleniumServer({
      jar: webdriver.selenium.path,
      args: webdriver.args
    });
    server.start().then(function(url) {
      var driver = new seleniumWebdriver.Builder()
        .usingServer(url)
        .withCapabilities(capabilities)
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
      
    });
  }, 20000);

});
