/* Adapted from https://github.com/Obvious/phantomjs/blob/master/install.js */

var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var AdmZip = require('adm-zip');
var kew = require('kew');
var npmconf = require('npmconf');
var tmp = require('tmp');

var webdriver = require('./lib/index.js');

npmconf.load(function(err, conf) {
  if (err) {
    console.log('Error loading npm config');
    console.error(err);
    process.exit(1);
    return;
  }
  
  if (!webdriver.platform) {
    console.log('Unexpected platform or architecture:', process.platform, process.arch);
    process.exit(1);
  }

  var tmpPath;

  var promise = getTmpDirectory()
    .then(function(tmpDirectory) {
      tmpPath = tmpDirectory;
      return downloadFile(
        conf.get('proxy'),
        webdriver.selenium.downloadUrl,
        webdriver.selenium.path
      );
    })
    .then(function() {
      return downloadFile(
        conf.get('proxy'),
        webdriver.chromedriver.downloadUrl,
        path.join(tmpPath, path.basename(webdriver.chromedriver.downloadUrl))
      );
    })
    .then(function() {
      return extractDownload(
        path.join(tmpPath, path.basename(webdriver.chromedriver.downloadUrl)),
        path.dirname(webdriver.chromedriver.path)
      );
    })
    .then(function() {
      return fixFilePermissions(webdriver.chromedriver.path);
    });

  if (webdriver.iedriver.downloadUrl) {
    promise = promise.then(function() {
      return downloadFile(
        conf.get('proxy'),
        webdriver.iedriver.downloadUrl,
        path.join(tmpPath, path.basename(webdriver.iedriver.downloadUrl))
      );
    })
    .then(function() {
      return extractDownload(
        path.join(tmpPath, path.basename(webdriver.iedriver.downloadUrl)),
        path.dirname(webdriver.iedriver.path)
      );
    })
    .then(function() {
      return fixFilePermissions(webdriver.iedriver.path);
    });
  }
  
  promise.then(function() {
    console.log([
      'Done. Selenium, Chromedriver',
      webdriver.iedriver.downloadUrl ? ', IEDriver' : '',
      ' available at ',
      path.dirname(webdriver.selenium.path)
    ].join(''));
  })
  .fail(function (err) {
    console.error('Installation of Selenium, Chromedriver or IEDriver failed', err.stack);
    process.exit(1)
  })
});

function getTmpDirectory() {
  var deferred = kew.defer()
  tmp.dir({mode: 0750, prefix: 'webdriver-setup_'}, function (error, path) {
    if (error) {
      deferred.reject('Error creating temporary directory: ' + error);
    }
    deferred.resolve(path);
  });
  return deferred.promise;
};

function downloadFile(proxy, downloadUrl, downloadPath) {
  console.log('Downloading', downloadUrl);
  console.log('Saving to', downloadPath);
  return requestBinary(getRequestOptions(proxy, downloadUrl), downloadPath);
}

function getRequestOptions(proxyUrl, downloadUrl) {
  if (proxyUrl) {
    var options = url.parse(proxyUrl)
    options.path = downloadUrl
    options.headers = { Host: url.parse(downloadUrl).host }
    // Turn basic authorization into proxy-authorization.
    if (options.auth) {
      options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(options.auth).toString('base64')
      delete options.auth
    }

    return options
  } else {
    return url.parse(downloadUrl)
  }
}

function requestBinary(requestOptions, filePath) {
  var deferred = kew.defer()

  var count = 0
  var notifiedCount = 0
  var outFile = fs.openSync(filePath, 'w')

  var client = http.get(requestOptions, function (response) {
    var status = response.statusCode
    console.log('Receiving...')

    if (status === 200) {
      response.addListener('data',   function (data) {
        fs.writeSync(outFile, data, 0, data.length, null)
        count += data.length
        if ((count - notifiedCount) > 800000) {
          console.log('Received ' + Math.floor(count / 1024) + 'K...')
          notifiedCount = count
        }
      })

      response.addListener('end',   function () {
        console.log('Received ' + Math.floor(count / 1024) + 'K total.')
        fs.closeSync(outFile)
        deferred.resolve(true)
      })

    } else {
      client.abort()
      deferred.reject('Error with http request: ' + util.inspect(response.headers))
    }
  })

  return deferred.promise
}

function extractDownload(filePath, extractToPath) {
  var deferred = kew.defer()
  var options = {cwd: extractToPath}

  console.log('Extracting zip contents')
  try {
    var zip = new AdmZip(filePath)
    zip.extractAllTo(extractToPath, true)
    deferred.resolve(true)
  } catch (err) {
    deferred.reject('Error extracting archive ' + err.stack)
  }
  return deferred.promise
}

function fixFilePermissions(filePath) {
  // Check that the binary is user-executable and fix it if it isn't (problems with unzip library)
  if (process.platform != 'win32') {
    var stat = fs.statSync(filePath)
    // 64 == 0100 (no octal literal in strict mode)
    if (!(stat.mode & 64)) {
      console.log('Fixing file permissions')
      fs.chmodSync(filePath, '755')
    }
  }
}
