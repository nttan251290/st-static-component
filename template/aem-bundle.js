/* eslint no-console: 0 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const request = require('request');

const cwd = process.cwd();

// Get config from app's package.json
const pkgJson = require(path.resolve(cwd, 'package.json'));

// --upload arg allows us to upload into local copy of AEM after bundling
const args = process.argv.slice(2);
const uploadAfterBundle = args[0] === '--upload';

// A collection of paths required for when we create our bundle
const tmpDir = path.resolve(cwd, 'tmp');
const templateDir = path.join(__dirname, '..', 'template', 'aem');
const buildDir = path.join(cwd, 'build');
const patternLibraryDir = path.join(tmpDir, 'pattern_library_package');
const zipFileName = 'package_library.zip';

const aemHost = 'http://admin:root@singtel-dev.decision-science.agency:4502/';

const defaultOptions = {
  name: 'lux2',
  path: '/etc/designs/springd/clientlibs/lux2'
};

let options = {};

// Override default options if we found custom options inside the app package.json
if (pkgJson.aem) {
  options.name = pkgJson.aem.name ? pkgJson.aem.name : defaultOptions.name;
  options.path = pkgJson.aem.path ? pkgJson.aem.path : defaultOptions.path;
} else {
  options = defaultOptions;
}

// Upload package_libray.zip into AEM
const uploadPatternLibrary = function(callback) {
  var formData = {
    name: 'pattern_library',
    force: 'true',
    install: 'true',
    file: fs.createReadStream(path.join(tmpDir, zipFileName))
  };
  request.post(
    {
      url: aemHost + 'crx/packmgr/service.jsp',
      formData: formData
    },
    function(err, httpResponse) {
      if (err) {
        return console.error('Upload failed:', err);
      }
      callback(httpResponse);
    }
  );
};

// Delete existing LUX2 from AEM
const deletePatternLibrary = function(callback) {
  request.del({ url: aemHost + options.path }, function(err) {
    if (err) {
      return console.error('Upload failed:', err);
    }
    console.log('Removed pattern library:', options.path);
    callback();
  });
};

// Create a zip of the LUX2 build folder
const prepare = function(callback) {
  let filePath, oldContent, newContent;
  let finalDir = path.join(patternLibraryDir, 'jcr_root', options.path);
  // Make sure temp folder exists
  fs.ensureDirSync(tmpDir);
  // Delete pattern library folder
  fs.removeSync(patternLibraryDir);
  // Copy AEM pattern template into temp folder
  fs.copySync(templateDir, tmpDir);
  // Create package directory that will contain our assets
  fs.mkdirsSync(finalDir);
  // Copy dist folder into temp folder
  fs.copySync(buildDir, finalDir);
  // Remove .html files
  fs
    .readdirSync(finalDir)
    .filter(function(elm) {
      return elm.match(/.*\.(html)/gi);
    })
    .forEach(function(htmlPath) {
      fs.removeSync(path.join(finalDir, htmlPath));
    });
  // Replace path inside META-INF/vault/filter.xml
  filePath = path.join(patternLibraryDir, 'META-INF', 'vault', 'filter.xml');
  oldContent = fs.readFileSync(filePath, 'utf8');
  newContent = oldContent.replace('{PATH}', options.path);
  fs.writeFileSync(filePath, newContent);
  // Replace name inside META-INF/vault/properties.xml
  filePath = path.join(
    patternLibraryDir,
    'META-INF',
    'vault',
    'properties.xml'
  );
  oldContent = fs.readFileSync(filePath, 'utf8');
  newContent = oldContent.replace('{NAME}', options.name);
  fs.writeFileSync(filePath, newContent);
  // Create zip
  const output = fs.createWriteStream(path.join(tmpDir, zipFileName));
  // Zip up the package library into this zip
  const archive = archiver('zip');
  // Output final size
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes zipped in ' + zipFileName);
    callback();
  });
  // Catch an errors
  archive.on('error', function(err) {
    throw err;
  });
  // pipe archive data to the file
  archive.pipe(output);
  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(patternLibraryDir, false);
  // finalize the archive
  archive.finalize();
};

// Make sure a build directory exists
if (!fs.existsSync(buildDir)) {
  console.log(
    'Build directory not found. Make sure you have a successful build of your app.'
  );
  return false;
}

console.log('Start of LUX bundling for AEM');
prepare(function() {
  if (uploadAfterBundle) {
    console.log('Preparing to upload to AEM');
    deletePatternLibrary(function() {
      uploadPatternLibrary(function(httpResponse) {
        console.log('Upload successful! Server responded with:', httpResponse);
      });
    });
  }
});