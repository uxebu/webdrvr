var requireMock = require('requiremock')(__filename);

describe('webdriver', function() {

  var webdriverModule;

  beforeEach(function() {
    var phantomjsMock = {
      version: '1.9.1',
      path: 'phantomjs'
    };
    requireMock.mock('phantomjs', function(){
      return phantomjsMock;
    });
    requireMock.mock('path', function() {
      return {
        join: function() {
          return Array.prototype.slice.call(arguments, 0).join('/');
        }
      }
    });
    webdriverModule = requireMock('../lib/index.js', '/webdriver-dir/lib/index.js', '/webdriver-dir/lib');
  });

  describe('phantomjs property', function() {
    it('provides information where to find "phantomjs"', function() {
      expect(webdriverModule().phantomjs).toEqual({
        version: '1.9.1',
        path: 'phantomjs',
        args: [ '-Dphantomjs.binary.path=phantomjs' ]
      });
    });
  });

  describe('platform property', function() {
    it('provides "undefined" when no valid platform was passed', function() {
      expect(webdriverModule().platform).toBeUndefined();
    });
    it('provides "win" when "win32" was passed as platform', function() {
      expect(webdriverModule({platform: 'win32'}).platform).toBe('win');
    });
    it('provides "linux" when "linux" was passed as platform', function() {
      expect(webdriverModule({platform: 'linux'}).platform).toBe('linux');
    });
    it('provides "mac" when "darwin" was passed as platform', function() {
      expect(webdriverModule({platform: 'darwin'}).platform).toBe('mac');
    });
  });

  describe('args property', function() {
    it('provides all driver arguments that can be passed to selenium.jar', function() {
      expect(webdriverModule().args).toEqual([
        '-Dwebdriver.chrome.driver=/webdriver-dir/lib/../vendor/chromedriver',
        '-Dphantomjs.binary.path=phantomjs',
        '-Dwebdriver.ie.driver=/webdriver-dir/lib/../vendor/IEDriverServer.exe'
      ]);
    });
  });

  describe('selenium property', function() {
    it('provides version, installation path, download URL of selenium', function() {
      expect(webdriverModule().selenium).toEqual({
        version: '2.34.0',
        path: '/webdriver-dir/lib/../vendor/selenium.jar',
        downloadUrl: 'http://selenium.googlecode.com/files/selenium-server-standalone-2.34.0.jar',
        args: [ '-jar', '/webdriver-dir/lib/../vendor/selenium.jar' ]
      });
    });
  });

  describe('chromedriver property', function() {

    describe('version property', function() {
      it('provides the current chromedriver version', function() {
        expect(webdriverModule().chromedriver.version).toBe('2.2');
      });
    });

    describe('path property', function() {
      it('provides the current chromedriver installation path', function() {
        expect(webdriverModule().chromedriver.path).toBe('/webdriver-dir/lib/../vendor/chromedriver');
      });
    });

    describe('args property', function() {
      it('provides the chromedriver command-line arguments for selenium.jar', function() {
        expect(webdriverModule().chromedriver.args).toEqual([
          '-Dwebdriver.chrome.driver=/webdriver-dir/lib/../vendor/chromedriver'
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('provides the downloadUrl for linux 32bit', function() {
        expect(webdriverModule({platform: 'linux', arch: 'ia32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux32_2.2.zip'
        );
      });
      it('provides the downloadUrl for linux 64bit', function() {
        expect(webdriverModule({platform: 'linux', arch: 'x64'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_linux64_2.2.zip'
        );
      });
      it('provides the downloadUrl for mac osx', function() {
        expect(webdriverModule({platform: 'darwin'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_mac32_2.2.zip'
        );
      });
      it('provides the downloadUrl for windows', function() {
        expect(webdriverModule({platform: 'win32'}).chromedriver.downloadUrl).toBe(
          'http://chromedriver.googlecode.com/files/chromedriver_win32_2.2.zip'
        );
      });
    });

  });
  
  describe('iedriver property', function() {

    describe('version property', function() {
      it('provides the current iedriver version', function() {
        expect(webdriverModule().iedriver.version).toBe('2.34.0');
      });
    });

    describe('path property', function() {
      it('provides the current iedriver installation path', function() {
        expect(webdriverModule().iedriver.path).toBe('/webdriver-dir/lib/../vendor/IEDriverServer.exe');
      });
    });

    describe('args property', function() {
      it('provides the IEDriver command-line arguments for selenium.jar', function() {
        expect(webdriverModule().iedriver.args).toEqual([
          '-Dwebdriver.ie.driver=/webdriver-dir/lib/../vendor/IEDriverServer.exe'
        ]);
      });
    });

    describe('downloadUrl property', function() {
      it('is "undefined" if non-windows platform was passed', function() {
        expect(webdriverModule({platform: 'linux'}).iedriver.downloadUrl).toBeUndefined();
      });
      it('provides the downloadUrl for Windows 32bit', function() {
        expect(webdriverModule({platform: 'win32', arch: 'ia32'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_Win32_2.34.0.zip'
        );
      });
      it('provides the downloadUrl for Windows 64bit', function() {
        expect(webdriverModule({platform: 'win32', arch: 'x64'}).iedriver.downloadUrl).toBe(
          'http://selenium.googlecode.com/files/IEDriverServer_x64_2.34.0.zip'
        );
      });
    });

  });

});
