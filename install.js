/* Adapted from https://github.com/Obvious/phantomjs/blob/master/install.js */

var fs = require('fs');
var httpModule = {
  http: require('follow-redirects').http,
  https: require('follow-redirects').https
};
var path = require('path');
var url = require('url');
var util = require('util');

var AdmZip = require('adm-zip');
var kew = require('kew');
var mkdirp = require('mkdirp');
var npmconf = require('npmconf');

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

  var tmpPath = findSuitableTempDirectory(conf.get('tmp'));
  var promise = kew.resolve(true);

  if (!fs.existsSync(path.join(tmpPath, path.basename(webdriver.selenium.downloadUrl)))) {
    promise = promise.then(function() {
      return downloadFile(
        conf.get('proxy'),
        webdriver.selenium.downloadUrl,
        path.join(tmpPath, path.basename(webdriver.selenium.downloadUrl))
      );
    });
  }
  promise = promise.then(function() {
    return copyFile(
      path.join(tmpPath, path.basename(webdriver.selenium.downloadUrl)),
      webdriver.selenium.path
    );
  });

  if (!fs.existsSync(path.join(tmpPath, path.basename(webdriver.chromedriver.downloadUrl)))) {
    promise = promise.then(function() {
      return downloadFile(
        conf.get('proxy'),
        webdriver.chromedriver.downloadUrl,
        path.join(tmpPath, path.basename(webdriver.chromedriver.downloadUrl))
      );
    });
  }
  promise = promise.then(function() {
    return extractDownload(
      path.join(tmpPath, path.basename(webdriver.chromedriver.downloadUrl)),
      path.dirname(webdriver.chromedriver.path)
    );
  })
  .then(function() {
    return fixFilePermissions(webdriver.chromedriver.path);
  });

  if (webdriver.iedriver.downloadUrl) {
    if (!fs.existsSync(path.join(tmpPath, path.basename(webdriver.iedriver.downloadUrl)))) {
      promise = promise.then(function() {
        return downloadFile(
          conf.get('proxy'),
          webdriver.iedriver.downloadUrl,
          path.join(tmpPath, path.basename(webdriver.iedriver.downloadUrl))
        );
      });
    }
    promise.then(function() {
      return extractDownload(
        path.join(tmpPath, path.basename(webdriver.iedriver.downloadUrl)),
        path.dirname(webdriver.iedriver.path)
      );
    })
    .then(function() {
      return fixFilePermissions(webdriver.iedriver.path);
    });
  }

  if (webdriver.iosdriver.downloadUrl) {
    if (!fs.existsSync(path.join(tmpPath, path.basename(webdriver.iosdriver.downloadUrl)))) {
      promise = promise.then(function() {
        return downloadFile(
          conf.get('proxy'),
          webdriver.iosdriver.downloadUrl,
          path.join(tmpPath, path.basename(webdriver.iosdriver.downloadUrl))
        );
      });
    }
    promise = promise.then(function() {
      return copyFile(
        path.join(tmpPath, path.basename(webdriver.iosdriver.downloadUrl)),
        webdriver.iosdriver.path
      );
    });
  }

  promise.then(function() {
    console.log([
      'Done. Selenium, Chromedriver',
      webdriver.iedriver.downloadUrl ? ', IEDriver' : '',
      webdriver.iosdriver.downloadUrl ? ', IOSDriver' : '',
      ' available at ',
      path.dirname(webdriver.selenium.path)
    ].join(''));
  })
  .fail(function(err) {
    console.error('Installation of Selenium, Chromedriver, IEDriver or IOSDriver failed', err.stack);
    process.exit(1);
  })
});

function findSuitableTempDirectory(npmTmpDir) {
  var now = Date.now();
  var candidateTmpDirs = [
    process.env.TMPDIR || '/tmp',
    npmTmpDir,
    path.join(process.cwd(), 'tmp')
  ];

  for (var i = 0; i < candidateTmpDirs.length; i++) {
    var candidatePath = path.join(candidateTmpDirs[i], 'webdrvr');

    try {
      mkdirp.sync(candidatePath, '0777');
      var testFile = path.join(candidatePath, now + '.tmp');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return candidatePath;
    } catch (e) {
      console.log(candidatePath, 'is not writable:', e.message);
    }
  }

  console.error('Cannot find a writable tmp directory');
  process.exit(1);
}

function downloadFile(proxy, downloadUrl, downloadPath) {
  console.log('Downloading', downloadUrl);
  console.log('Saving to', downloadPath);
  return requestBinary(getRequestOptions(proxy, downloadUrl), downloadPath);
}

function copyFile(fromFilePath, toFilePath) {
  var deferred = kew.defer();
  var toFileFolder = path.dirname(toFilePath);

  // ensure that the destination folder exists
  try {
    fs.mkdirSync(toFileFolder);
  } catch(error) {}

  var writeStream = fs.createWriteStream(toFilePath);
  writeStream.on('open', function() {
    fs.createReadStream(fromFilePath).pipe(writeStream);
  }).on('finish', function() {
    deferred.resolve(true);
  }).on('error', function(error) {
    deferred.reject(new Error('Error copying file: ' + error));
  });

  return deferred;
}

function getRequestOptions(proxyUrl, downloadUrl) {
  if (proxyUrl) {
    var options = url.parse(proxyUrl);
    options.path = downloadUrl;
    options.headers = { Host: url.parse(downloadUrl).host };
    // If going through proxy, spoof the User-Agent, since may commerical proxies block blank or unknown agents in headers
    options.headers['User-Agent'] = 'curl/7.21.4 (universal-apple-darwin11.0) libcurl/7.21.4 OpenSSL/0.9.8r zlib/1.2.5'
    // Turn basic authorization into proxy-authorization.
    if (options.auth) {
      options.headers['Proxy-Authorization'] = 'Basic ' + new Buffer(options.auth).toString('base64');
      delete options.auth;
    }

    return options;
  } else {
    return url.parse(downloadUrl);
  }
}

function requestBinary(requestOptions, filePath) {
  var deferred = kew.defer();

  var count = 0;
  var notifiedCount = 0;
  var filePath = filePath;
  var tmpFilePath = filePath + '.tmp';
  var outFile = fs.openSync(tmpFilePath, 'w');
  var protocol = requestOptions.protocol.slice(0, requestOptions.protocol.length - 1);

  var client = httpModule[protocol].get(requestOptions, function(response) {
    var status = response.statusCode;
    console.log('Receiving...');

    if (status === 200) {
      response.addListener('data', function(data) {
        fs.writeSync(outFile, data, 0, data.length, null);
        count += data.length;
        if ((count - notifiedCount) > 800000) {
          console.log('Received ' + Math.floor(count / 1024) + 'K...');
          notifiedCount = count;
        }
      })

      response.addListener('end', function() {
        console.log('Received ' + Math.floor(count / 1024) + 'K total.');
        fs.closeSync(outFile);
        // just write the final file when download was completed
        copyFile(tmpFilePath, filePath).then(function() {
          deferred.resolve(true);
        }).fail(function(error) {
          deferred.reject(error);
        });
      })

    } else {
      client.abort();
      deferred.reject(new Error('Error with http request: ' + util.inspect(response.headers)));
    }
  });

  return deferred.promise;
}

function extractDownload(filePath, extractToPath) {
  var deferred = kew.defer();
  var options = {cwd: extractToPath};

  console.log('Extracting zip contents of ' + filePath);
  try {
    var zip = new AdmZip(filePath);
    zip.extractAllTo(extractToPath, true);
    deferred.resolve(true);
  } catch (err) {
    deferred.reject(new Error('Error extracting archive ' + err.stack));
  }
  return deferred.promise;
}

function fixFilePermissions(filePath) {
  // Check that the binary is user-executable and fix it if it isn't (problems with unzip library)
  if (process.platform != 'win32') {
    var stat = fs.statSync(filePath);
    // 64 == 0100 (no octal literal in strict mode)
    if (!(stat.mode & 64)) {
      console.log('Fixing file permissions of ' + filePath);
      fs.chmodSync(filePath, '755');
    }
  }
}
