var SandboxedModule = require('sandboxed-module');

var path = require('path');
var phantomjs = require('phantomjs');

describe('webdriver', function() {

  var vendorPath, webdriverModule;

  beforeEach(function() {
    webdriverModule = SandboxedModule.require('../lib/index.js', {
      locals: {
        __filename: path.join('webdriver-dir', 'lib', 'index.js'),
        __dirname: path.join('webdriver-dir', 'lib')
      }
    });
    vendorPath = path.join('webdriver-dir', 'lib', '..', 'vendor');
  });

  describe('phantomjs property', function() {
    it('provides information where to find "phantomjs"', function() {
      expect(webdriverModule.getWebdriverEnv().phantomjs).toEqual({
        version: phantomjs.version,
        path: phantomjs.path,
        args: ['-Dphantomjs.binary.path=' + phantomjs.path]
      });
    });
  });

  describe('platform property', function() {
    it('provides "undefined" when no valid platform was passed', function() {
      expect(webdriverModule.getWebdriverEnv().platform).toBeUndefined();
    });
    it('provides "win" when "win32" was passed as platform', function() {
      expect(webdriverModule.getWebdriverEnv({platform: 'win32'}).platform).toBe('win');
    });
    it('provides "linux" when "linux" was passed as platform', function() {
      expect(webdriverModule.getWebdriverEnv({platform: 'linux'}).platform).toBe('linux');
    });
    it('provides "mac" when "darwin" was passed as platform', function() {
      expect(webdriverModule.getWebdriverEnv({platform: 'darwin'}).platform).toBe('mac');
    });
  });

  describe('args property', function() {
    it('provides all driver arguments that can be passed to selenium.jar', function() {
      expect(webdriverModule.getWebdriverEnv().args).toEqual([
        '-Dwebdriver.chrome.driver=' + path.join(vendorPath, 'chromedriver'),
        '-Dphantomjs.binary.path=' + phantomjs.path,
        '-Dwebdriver.ie.driver=' + path.join(vendorPath, 'IEDriverServer.exe')
      ]);
    });
  });

  describe('selenium property', function() {
    it('provides version, installation path, download URL of selenium', function() {
      expect(webdriverModule.getWebdriverEnv().selenium).toEqual({
        version: '2.35.0',
        path: path.join(vendorPath, 'selenium.jar'),
        downloadUrl: 'http://selenium.googlecode.com/files/selenium-server-standalone-2.35.0.jar',
        args: ['-jar', path.join(vendorPath, 'selenium.jar')]
      });
    });
  });

  describe('chromedriver property', function() {

    describe('version property', function() {
      it('provides the current chromedriver version', function() {
        expect(webdriverModule.getWebdriverEnv().chromedriver.version).toBe('2.2');
      });
    });

    describe('path property', function() {
      it('provides the current chromedriver installation path', function() {
        expect(webdriverModule.getWebdriverEnv().chromedriver.path).toBe(path.join(vendorPath, 'chromedriver'));
      });
    });

    describe('args property', function() {
      it('provides the chromedriver command-line arguments for selenium.jar', function() {
        expect(webdriverModule.getWebdriverEnv().chromedriver.args).toEqual([
          '-Dwebdriver.chrome.driver=' + path.join(vendorPath, 'chromedriver')
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('provides the downloadUrl for linux 32bit', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'linux', arch: 'ia32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux32_2.2.zip'
        );
      });
      it('provides the downloadUrl for linux 64bit', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'linux', arch: 'x64'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux64_2.2.zip'
        );
      });
      it('provides the downloadUrl for mac osx', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'darwin'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_mac32_2.2.zip'
        );
      });
      it('provides the downloadUrl for windows', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'win32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_win32_2.2.zip'
        );
      });
    });

  });
  
  describe('iedriver property', function() {

    describe('version property', function() {
      it('provides the current iedriver version', function() {
        expect(webdriverModule.getWebdriverEnv().iedriver.version).toBe('2.35.0');
      });
    });

    describe('path property', function() {
      it('provides the current iedriver installation path', function() {
        expect(webdriverModule.getWebdriverEnv().iedriver.path).toBe(path.join(vendorPath, 'IEDriverServer.exe'));
      });
    });

    describe('args property', function() {
      it('provides the IEDriver command-line arguments for selenium.jar', function() {
        expect(webdriverModule.getWebdriverEnv().iedriver.args).toEqual([
          '-Dwebdriver.ie.driver=' + path.join(vendorPath, 'IEDriverServer.exe')
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('is "undefined" if non-windows platform was passed', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'linux'}).iedriver.downloadUrl).toBeUndefined();
      });
      it('provides the downloadUrl for Windows 32bit', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'win32', arch: 'ia32'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_Win32_2.35.0.zip'
        );
      });
      it('provides the downloadUrl for Windows 64bit', function() {
        expect(webdriverModule.getWebdriverEnv({platform: 'win32', arch: 'x64'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_x64_2.35.0.zip'
        );
      });
    });

  });

});
