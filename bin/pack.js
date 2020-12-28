const fs = require("fs");
const path = require("path");
const SVGO = require("svgo");

const svgo = new SVGO({
  plugins: [{ removeTitle: true }, { removeAttrs: { attrs: "(class)" } }]
});

function isSVG(filename) {
  return path.extname(filename) === ".svg";
}

function readSVG(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      svgo.optimize(data, { path: filename }).then(result => {
        resolve({
          name: path.basename(filename, ".svg"),
          content: result.data
        });
      }, reject);
    });
  });
}

function readDir(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        return reject(err);
      }
      const abs = file => path.join(dir, file);
      return resolve(
        Promise.all(
          files
            .filter(isSVG)
            .map(abs)
            .map(readSVG)
        )
      );
    });
  });
}

function writeFile(filename, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, content, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * 将一个目录下的所有 svg 打包成一个 json 文件
 * @param {String} inputSVGDir svg 所在目录，例如: path/to/resource/icon
 * @param {String} outputJSONFile json 文件，例如: path/to/resource/icons.json
 */
function pack(inputSVGDir, outputJSONFile) {
  readDir(inputSVGDir)
    .then(svgs => {
      const data = svgs.reduce((obj, { name, content }) => {
        obj[name] = content;
        return obj;
      }, {});
      return writeFile(outputJSONFile, JSON.stringify(data, null, 2));
    })
    .catch(err => {
      throw new Error(err);
    });
}

module.exports = pack;
