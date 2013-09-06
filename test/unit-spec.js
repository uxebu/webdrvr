var path = require('path');
var phantomjs = require('phantomjs');

var webdrvrLibPath = path.dirname(require.resolve('../lib/index.js'));
var webdrvrModule = require('../lib/index.js');
var vendorPath = path.join(webdrvrLibPath, '..', 'vendor');

describe('webdrvr', function() {

  describe('phantomjs property', function() {
    it('provides information where to find "phantomjs"', function() {
      expect(webdrvrModule.getEnv().phantomjs).toEqual({
        version: phantomjs.version,
        path: phantomjs.path,
        args: ['-Dphantomjs.binary.path=' + phantomjs.path]
      });
    });
  });

  describe('platform property', function() {
    it('provides "undefined" when no valid platform was passed', function() {
      expect(webdrvrModule.getEnv().platform).toBeUndefined();
    });
    it('provides "win" when "win32" was passed as platform', function() {
      expect(webdrvrModule.getEnv({platform: 'win32'}).platform).toBe('win');
    });
    it('provides "linux" when "linux" was passed as platform', function() {
      expect(webdrvrModule.getEnv({platform: 'linux'}).platform).toBe('linux');
    });
    it('provides "mac" when "darwin" was passed as platform', function() {
      expect(webdrvrModule.getEnv({platform: 'darwin'}).platform).toBe('mac');
    });
  });

  describe('args property', function() {
    it('provides all driver arguments that can be passed to selenium.jar', function() {
      expect(webdrvrModule.getEnv().args).toEqual([
        '-Dwebdriver.chrome.driver=' + path.join(vendorPath, 'chromedriver'),
        '-Dphantomjs.binary.path=' + phantomjs.path,
        '-Dwebdriver.ie.driver=' + path.join(vendorPath, 'IEDriverServer.exe')
      ]);
    });
  });

  describe('selenium property', function() {
    it('provides version, installation path, download URL of selenium', function() {
      expect(webdrvrModule.getEnv().selenium).toEqual({
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
        expect(webdrvrModule.getEnv().chromedriver.version).toBe('2.2');
      });
    });

    describe('path property', function() {
      it('provides the current chromedriver installation path', function() {
        expect(webdrvrModule.getEnv().chromedriver.path).toBe(path.join(vendorPath, 'chromedriver'));
      });
    });

    describe('args property', function() {
      it('provides the chromedriver command-line arguments for selenium.jar', function() {
        expect(webdrvrModule.getEnv().chromedriver.args).toEqual([
          '-Dwebdriver.chrome.driver=' + path.join(vendorPath, 'chromedriver')
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('provides the downloadUrl for linux 32bit', function() {
        expect(webdrvrModule.getEnv({platform: 'linux', arch: 'ia32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux32_2.2.zip'
        );
      });
      it('provides the downloadUrl for linux 64bit', function() {
        expect(webdrvrModule.getEnv({platform: 'linux', arch: 'x64'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux64_2.2.zip'
        );
      });
      it('provides the downloadUrl for mac osx', function() {
        expect(webdrvrModule.getEnv({platform: 'darwin'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_mac32_2.2.zip'
        );
      });
      it('provides the downloadUrl for windows', function() {
        expect(webdrvrModule.getEnv({platform: 'win32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_win32_2.2.zip'
        );
      });
    });

  });
  
  describe('iedriver property', function() {

    describe('version property', function() {
      it('provides the current iedriver version', function() {
        expect(webdrvrModule.getEnv().iedriver.version).toBe('2.35.1');
      });
    });

    describe('path property', function() {
      it('provides the current iedriver installation path', function() {
        expect(webdrvrModule.getEnv().iedriver.path).toBe(path.join(vendorPath, 'IEDriverServer.exe'));
      });
    });

    describe('args property', function() {
      it('provides the IEDriver command-line arguments for selenium.jar', function() {
        expect(webdrvrModule.getEnv().iedriver.args).toEqual([
          '-Dwebdriver.ie.driver=' + path.join(vendorPath, 'IEDriverServer.exe')
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('is "undefined" if non-windows platform was passed', function() {
        expect(webdrvrModule.getEnv({platform: 'linux'}).iedriver.downloadUrl).toBeUndefined();
      });
      it('provides the downloadUrl for Windows 32bit', function() {
        expect(webdrvrModule.getEnv({platform: 'win32', arch: 'ia32'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_Win32_2.35.1.zip'
        );
      });
      it('provides the downloadUrl for Windows 64bit', function() {
        expect(webdrvrModule.getEnv({platform: 'win32', arch: 'x64'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_x64_2.35.1.zip'
        );
      });
    });

  });

});
