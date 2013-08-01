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

## Running via node

~~~js
var childProcess = require('child_process');
var webdriver = require('webdriver');
var childArgs = webdriver.selenium.args
  .concat(webdriver.chromedriver.args)
  .concat(webdriver.phantomjs.args)
  .concat(webdriver.iedriver.args)
  .concat([
    'Other Selenium args that should be passed'
  ]);

childProcess.execFile(webdriver.execFile, childArgs, function(err, stdout, stderr) {
  // server got started
});

~~~
