/**
 * @fileoverview WebDriver setup made available via require('webdriver-setup') once package is
 * installed.
 */

var path = require('path');
var phantomjs = require('phantomjs');

var platform;

if (process.platform === 'linux') {
  platform = 'linux';
} else if (process.platform === 'darwin') {
  platform = 'mac';
} else if (process.platform === 'win32') {
  platform = 'win'
}

var SELENIUM_VERSION = '2.33.0';
var CHROMEDRIVER_VERSION = '2.1';
var IEDRIVER_VERSION = '2.33.0';

var SELENIUM_DOWNLOAD_URL = [
  'http://selenium.googlecode.com/files/selenium-server-standalone-',
  SELENIUM_VERSION,
  '.jar'
].join('');

var CHROMEDRIVER_DOWNLOAD_URL = [
  'http://chromedriver.googlecode.com/files/chromedriver_',
  // win32 / mac32 / linux32 / linux64
  platform + (platform === 'linux' && process.arch === 'x64' ? '64' : '32'),
  '_',
  CHROMEDRIVER_VERSION,
  '.zip'
].join('');

var IEDRIVER_DOWNLOAD_URL;

if (platform === 'win') {
  IEDRIVER_DOWNLOAD_URL = [
    'http://selenium.googlecode.com/files/IEDriverServer_',
    // x64 / Win32
    'Win32',
    '_',
    '2.33.0',
    '.zip'
  ].join('');
}

var VENDOR_PATH = path.join(__dirname, '..', 'vendor');

var SELENIUM_PATH = path.join(VENDOR_PATH, 'selenium.jar');
var CHROMEDRIVER_PATH = path.join(VENDOR_PATH, 'chromedriver' + (platform === 'win' ? '.exe' : ''));
var IEDRIVER_PATH = path.join(VENDOR_PATH, 'IEDriverServer.exe');

exports.platform = platform;

/**
 * Executable java binary
 * @type {string}
 */
exports.execFile = 'java';

/**
 * Environment for executing selenium. Exposing phantomjs on PATH.
 * @type {object}
 */
exports.execEnv = {
  PATH: path.dirname(phantomjs.path)
};

/**
 * Where which version of selenium.jar can be found and what commandline arguments need to be passed to java
 * executable.
 * @type {object}
 */
exports.selenium = {
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
exports.chromedriver = {
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
exports.iedriver = {
  version: IEDRIVER_VERSION,
  path: IEDRIVER_PATH,
  downloadUrl: IEDRIVER_DOWNLOAD_URL,
  args: process.platform !== 'win32' ? ['-Dwebdriver.ie.driver=' + IEDRIVER_PATH] : []
}
