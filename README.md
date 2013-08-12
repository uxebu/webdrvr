# webdriver

An NPM wrapper for [Selenium Webdriver](http://code.google.com/p/selenium/), a browser automation framework
including [Chromedriver](http://code.google.com/p/chromedriver/), [IEDriver](http://code.google.com/p/selenium/wiki/InternetExplorerDriver)
(when applicable) and [Ghostdriver](https://github.com/detro/ghostdriver) (which is part of [PhantomJS](http://phantomjs.org/)).

Thanks to https://github.com/Obvious/phantomjs for the process how to download / handle varying binaries in node.

## Building and installing

~~~bash
npm install webdriver
~~~

What this is really doing is just grabbing a particular "blessed" (by this module) version of Selenium, Chromedriver,
IEDriver and PhantomJS. As new versions are released and vetted, this module will be updated accordingly.

## Running

~~~bash
bin/webdriver [selenium arguments] // see "bin/webdriver -h" for possible arguments
~~~

## Running via node (using `child_process`)

~~~js
var childProcess = require('child_process');
// passing information about current environment
var webdriver = require('webdriver');
var childArgs = webdriver.args.concat([
  '-jar', webdriver.selenium.path
  '-p', '44524'
  // further selenium arguments
]);

childProcess.execFile('java', childArgs, function(err, stdout, stderr) {
  // server got started
});
~~~

## Running via [selenium-webdriver](https://npmjs.org/package/selenium-webdriver)

~~~js
var remote = require('selenium-webdriver/remote');
var webdriver = require('webdriver');

// further options: https://code.google.com/p/selenium/source/browse/javascript/node/selenium-webdriver/remote/index.js#30
var server = new webdriver.SeleniumServer(webdriver.selenium.path, {
  args: webdriver.args
});
server.start().then(function(url) {
  console.log('Selenium standalone server started at ' + url);
});
// stopping the server
// server.stop();
~~~

## Versioning

The NPM package version tracks the version of Selenium that will be installed, with an additional build number that
is used for revisions of the installer.

As such 2.33.0-0 and 2.33.0-1 will both install Selenium 2.33.0 but the latter has newer changes to the installer.
