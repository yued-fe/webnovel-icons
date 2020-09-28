/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const path = require('path');
const fs = require('fs');
const upperCamelCase = require('uppercamelcase');
const processSvg = require('./processSvg');
const getComponent = require('./getComponent');
const getNunjucks = require('./getNunjucks');
const icons = require('../src/data.json');

// rootDir
const rootDir = path.join(__dirname, '..');

// where icons code in
const srcDir = path.join(rootDir, 'dist');
const srcDistDir = path.join(rootDir, 'src/dist');
const iconsDir = path.join(rootDir, 'src/dist/icons');
const htmlNunjucks = path.join(rootDir, 'dist/Icons.html');

// where index.js code in
const iconFile = path.join(rootDir, 'src/dist', 'index.js');
const iconFileD = path.join(rootDir, 'dist', 'index.d.ts');

const _api = {
  // generate icon code separately
  generateIconCode: async ({name}) => {
    const ComponentName = `I${upperCamelCase(name)}`;
    // console.log(names);
    const location = path.join(rootDir, 'src/svg', `${name}.svg`);
    const code = fs.readFileSync(location);
    const [svgComponent, svgCode, attrs] = await processSvg(code);

    // svg component
    const element = getComponent(ComponentName, svgComponent, attrs);
    const destination = path.join(iconsDir, `${ComponentName}.js`);
    fs.writeFileSync(destination, element, 'utf-8');

    // svg nunjucks
    const eleNjks = getNunjucks(ComponentName, svgCode, attrs);
    fs.appendFileSync(htmlNunjucks, eleNjks, 'utf-8');

    console.log('Successfully built', ComponentName);
    return ComponentName;
  },
  // generate icons.js and icons.d.ts file
  generateIconsIndex: () => {
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    if (!fs.existsSync(srcDistDir)) {
      fs.mkdirSync(srcDistDir);
    }

    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir);
    }
    if (!fs.existsSync(htmlNunjucks)) {
      fs.writeFileSync(htmlNunjucks, '', 'utf-8');
    }

    const initialTypeDefinitions = `
import { SVGAttributes } from 'react';
type Icon = (props?: SVGAttributes<SVGElement>) => JSX.Element;

// export icons
`;
    fs.writeFileSync(iconFile, '', 'utf-8');
    fs.writeFileSync(iconFileD, initialTypeDefinitions, 'utf-8');
  },
  // append export code to icons.js
  appendToIconsIndex: (ComponentNames = []) => {
    let exportString = '';
    let exportTypeString = '';
    [...new Set(ComponentNames)].sort().map((ComponentName) => {
      exportString += `export { default as ${ComponentName} } from './icons/${ComponentName}';\r\n`;
      exportTypeString += `export const ${ComponentName}: Icon;\n`;
    });
    fs.writeFileSync(iconFile, exportString, 'utf-8');
    fs.appendFileSync(iconFileD, exportTypeString, 'utf-8');
  },
  getComponentsInfo: async function () {
    const infoComponents = [];
    const iconKeys = Object.keys(icons).map(key => icons[key]);
    for (const {name} of iconKeys) {
      // ignore the icon with '_' start
      const isIgnore = name.charAt(0) === '_';
      if (!isIgnore) {
        await _api
          .generateIconCode({name})
          .then(ComponentName => {
            infoComponents.push(ComponentName);
          });
      }
    }
    return infoComponents;
  },
  init: function () {
    // create base file icons.js and icons.d.ts
    _api.generateIconsIndex();
    _api.getComponentsInfo().then(_api.appendToIconsIndex);
  },
};

_api.init();
