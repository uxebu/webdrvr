/**
 * @fileoverview webdrvr made available via require('webdrvr') once package is
 * installed.
 */

var path = require('path');
var phantomjs = require('phantomjs');

function removePatchVersion(versionString) {
  versionString = versionString.split('.');
  versionString.length = 2;
  return versionString.join('.');
}

var getEnv = function(env) {

  env = env || {};

  var webdriver = {};

  var platform;

  if (env.platform === 'linux') {
    platform = 'linux';
  } else if (env.platform === 'darwin') {
    platform = 'mac';
  } else if (env.platform === 'win32') {
    platform = 'win'
  }

  var SELENIUM_VERSION = '2.43.1';
  var CHROMEDRIVER_VERSION = '2.10';
  var IEDRIVER_VERSION = '2.43.0';
  var IOSDRIVER_VERSION = '0.6.5';
  var SELENIUM_DOWNLOAD_URL = [
    'http://selenium-release.storage.googleapis.com/',
    removePatchVersion(SELENIUM_VERSION),
    '/selenium-server-standalone-',
    SELENIUM_VERSION,
    '.jar'
  ].join('');

  var CHROMEDRIVER_DOWNLOAD_URL = [
    'http://chromedriver.storage.googleapis.com/',
    CHROMEDRIVER_VERSION,
    '/chromedriver_',
    // win32 / mac32 / linux32 / linux64
    platform + (platform === 'linux' && env.arch === 'x64' ? '64' : '32'),
    '.zip'
  ].join('');

  var IEDRIVER_DOWNLOAD_URL;

  if (platform === 'win') {
    IEDRIVER_DOWNLOAD_URL = [
      'http://selenium-release.storage.googleapis.com/',
      removePatchVersion(IEDRIVER_VERSION),
      '/IEDriverServer_',
      // x64 / Win32
      (env.arch === 'x64' ? 'x64' : 'Win32'),
      '_',
      IEDRIVER_VERSION,
      '.zip'
    ].join('');
  }

  var IOSDRIVER_DOWNLOAD_URL;

  if (platform === 'mac') {
    IOSDRIVER_DOWNLOAD_URL = [
      'https://github.com/ios-driver/ios-driver/releases/download/',
	  IOSDRIVER_VERSION,
	  '/ios-server-',
      IOSDRIVER_VERSION,
      '-jar-with-dependencies.jar'
    ].join('');
  }

  var VENDOR_PATH = path.join(__dirname, '..', 'vendor');

  var SELENIUM_PATH = path.join(VENDOR_PATH, 'selenium.jar');
  var CHROMEDRIVER_PATH = path.join(VENDOR_PATH, 'chromedriver' + (platform === 'win' ? '.exe' : ''));
  var IEDRIVER_PATH = path.join(VENDOR_PATH, 'IEDriverServer.exe');
  var IOSDRIVER_PATH = path.join(VENDOR_PATH, 'ios-driver.jar');

  webdriver.platform = platform;

  /**
   * Where which version of selenium.jar can be found and what commandline arguments need to be passed to java
   * executable.
   * @type {object}
   */
  webdriver.selenium = {
    version: SELENIUM_VERSION,
    path: SELENIUM_PATH,
    downloadUrl: SELENIUM_DOWNLOAD_URL,
    args: ['-jar', SELENIUM_PATH]
  };

  /**
   * Where which version of chromedriver binary can be found and what commandline arguments need to be passed
   * to selenium.jar.
   * @type {object}
   */
  webdriver.chromedriver = {
    version: CHROMEDRIVER_VERSION,
    path: CHROMEDRIVER_PATH,
    downloadUrl: CHROMEDRIVER_DOWNLOAD_URL,
    args: ['-Dwebdriver.chrome.driver=' + CHROMEDRIVER_PATH]
  };

  /**
   * Where which version of IEDriver binary can be found and what commandline arguments need to be passed
   * to selenium.jar.
   * @type {object}
   */
  webdriver.iedriver = {
    version: IEDRIVER_VERSION,
    path: IEDRIVER_PATH,
    downloadUrl: IEDRIVER_DOWNLOAD_URL,
    args: env.platform == 'win32' ? ['-Dwebdriver.ie.driver=' + IEDRIVER_PATH] : []
  };

  /**
   * Where which version of IOSDriver executable can be found and what commandline arguments need to be passed
   * to selenium.jar.
   * @type {object}
   */
  webdriver.iosdriver = {
    version: IOSDRIVER_VERSION,
    path: IOSDRIVER_PATH,
    downloadUrl: IOSDRIVER_DOWNLOAD_URL,
    args: []
  };

  /**
   * Where which version of PhantomJS binary can be found and what commandline arguments need to be passed
   * to selenium.jar.
   * @type {object}
   */
  webdriver.phantomjs = {
    version: phantomjs.version,
    path: phantomjs.path,
    args: ['-Dphantomjs.binary.path=' + phantomjs.path]
  };

  /**
   * Combined used driver arguments for selenium.jar
   * @type {string}
   */
  webdriver.args = webdriver.chromedriver.args
    .concat(webdriver.phantomjs.args, webdriver.iedriver.args);

  return webdriver;
};

module.exports = getEnv(process);
module.exports.getEnv = getEnv;
