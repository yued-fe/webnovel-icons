/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const path = require('path');
const fs = require('fs');
const upperCamelCase = require('uppercamelcase');
const processSvg = require('./processSvg');
const getElementCode = require('./template');
const icons = require('../src/data.json');

// rootDir
const rootDir = path.join(__dirname, '..');

// where icons code in
const srcDir = path.join(rootDir, 'dist');
const iconsDir = path.join(rootDir, 'dist/icons');

// where index.js code in
const iconFile = path.join(rootDir, 'dist', 'index.js');
const iconFileD = path.join(rootDir, 'dist', 'index.d.ts');

const _api = {
  // generate icon code separately
  generateIconCode: async ({name}) => {
    const ComponentName = `I${upperCamelCase(name)}`;
    // console.log(names);
    const location = path.join(rootDir, 'src/svg', `${name}.svg`);
    const code = fs.readFileSync(location);
    const svgCode = await processSvg(code);
    const element = getElementCode(ComponentName, svgCode);
    const destination = path.join(rootDir, 'dist/icons', `${ComponentName}.js`);
    fs.writeFileSync(destination, element, 'utf-8');
    console.log('Successfully built', ComponentName);
    return ComponentName;
  },
  // generate icons.js and icons.d.ts file
  generateIconsIndex: () => {
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
      fs.mkdirSync(iconsDir);
    } else if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir);
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
    [...new Set(ComponentNames)].sort().map((ComponentName)=>{
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
