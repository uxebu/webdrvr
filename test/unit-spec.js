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
        '-Dphantomjs.binary.path=' + phantomjs.path
      ]);
    });
  });

  describe('selenium property', function() {
    it('provides version, installation path, download URL of selenium', function() {
      expect(webdrvrModule.getEnv().selenium).toEqual({
        version: '2.43.1',
        path: path.join(vendorPath, 'selenium.jar'),
        downloadUrl: 'http://selenium-release.storage.googleapis.com/2.43/selenium-server-standalone-2.43.1.jar',
        args: ['-jar', path.join(vendorPath, 'selenium.jar')]
      });
    });
  });

  describe('chromedriver property', function() {

    describe('version property', function() {
      it('provides the current chromedriver version', function() {
        expect(webdrvrModule.getEnv().chromedriver.version).toBe('2.10');
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
          'http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux32.zip'
        );
      });
      it('provides the downloadUrl for linux 64bit', function() {
        expect(webdrvrModule.getEnv({platform: 'linux', arch: 'x64'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.storage.googleapis.com/2.10/chromedriver_linux64.zip'
        );
      });
      it('provides the downloadUrl for mac osx', function() {
        expect(webdrvrModule.getEnv({platform: 'darwin'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.storage.googleapis.com/2.10/chromedriver_mac32.zip'
        );
      });
      it('provides the downloadUrl for windows', function() {
        expect(webdrvrModule.getEnv({platform: 'win32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.storage.googleapis.com/2.10/chromedriver_win32.zip'
        );
      });
    });

  });
  
  describe('iedriver property', function() {

    describe('version property', function() {
      it('provides the current iedriver version', function() {
        expect(webdrvrModule.getEnv().iedriver.version).toBe('2.43.0');
      });
    });

    describe('path property', function() {
      it('provides the current iedriver installation path', function() {
        expect(webdrvrModule.getEnv().iedriver.path).toBe(path.join(vendorPath, 'IEDriverServer.exe'));
      });
    });

    describe('args property', function() {
      it('provides the IEDriver command-line arguments for selenium.jar', function() {
        expect(webdrvrModule.getEnv({platform: 'win32'}).iedriver.args).toEqual([
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
          'http://selenium-release.storage.googleapis.com/2.43/IEDriverServer_Win32_2.43.0.zip'
        );
      });
      it('provides the downloadUrl for Windows 64bit', function() {
        expect(webdrvrModule.getEnv({platform: 'win32', arch: 'x64'}).iedriver.downloadUrl).toBe(
          'http://selenium-release.storage.googleapis.com/2.43/IEDriverServer_x64_2.43.0.zip'
        );
      });
    });

  });

  describe('iosdriver property', function() {
    describe('version property', function() {
      it('provides the current iosdriver version', function() {
        expect(webdrvrModule.getEnv().iosdriver.version).toBe('0.6.5');
      });
    });

    describe('path property', function() {
      it('provides the current iosdriver installation path', function() {
        expect(webdrvrModule.getEnv().iosdriver.path).toBe(path.join(vendorPath, 'ios-driver.jar'));
      });
    });

    describe('args property', function() {
      it('is empty because it cannot be started with selenium', function() {
        expect(webdrvrModule.getEnv().iosdriver.args).toEqual([]);
      });
    });

    describe('downloadUrl property', function() {
      it('is "undefined" if non-mac platform was passed', function() {
        expect(webdrvrModule.getEnv({platform: 'linux'}).iosdriver.downloadUrl).toBeUndefined();
      });
      it('provides the downloadUrl for Mac', function() {
        expect(webdrvrModule.getEnv({platform: 'darwin'}).iosdriver.downloadUrl).toBe(
          'https://github.com/ios-driver/ios-driver/releases/download/0.6.5/ios-server-0.6.5-jar-with-dependencies.jar'
        );
      });
    });
  });


});
