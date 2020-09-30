/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const path = require('path');
const fs = require('fs');
const upperCamelCase = require('uppercamelcase');
const processSvg = require('./processSvg');
const getComponent = require('./getComponent');
const getNjsSymbol = require('./getNjsSymbol');
const icons = require('../src/data.json');


const dirRoot = path.join(__dirname, '..');
const dirDist = path.join(dirRoot, 'dist');
const dirDistNjs = path.join(dirDist, 'nunjucks');
const dirDistSvg = path.join(dirDistNjs, 'Svg.html');
const dirDistIcons = path.join(dirDistNjs, 'Icons.html');
const dirDistIndexD = path.join(dirDist, 'index.d.ts');
const dirSrc = path.join(dirRoot, 'src');
const dirSrcDist = path.join(dirSrc, 'dist');
const dirSrcIcons = path.join(dirSrcDist, 'icons');
const dirSrcSvg = path.join(dirSrc, 'nunjucks/Svg.html');
const dirSrcIndex = path.join(dirSrcDist, 'index.js');

const _api = {
  // generate icon code separately
  generateIconCode: async ({name}) => {
    const ComponentName = `I${upperCamelCase(name)}`;
    // console.log(names);
    const location = path.join(dirRoot, 'src/svg', `${name}.svg`);
    const code = fs.readFileSync(location);
    const [svgComponent, svgCode, attrs] = await processSvg(code);

    // svg component
    const element = getComponent(ComponentName, svgComponent, attrs);
    const destination = path.join(dirSrcIcons, `${ComponentName}.js`);
    fs.writeFileSync(destination, element, 'utf-8');

    // svg nunjucks
    const eleNjs = getNjsSymbol(ComponentName, svgCode, attrs);
    fs.appendFileSync(dirDistIcons, eleNjs, 'utf-8');

    console.log('Successfully built', ComponentName);
    return ComponentName;
  },
  // generate icons.js and icons.d.ts file
  generateIconsIndex: () => {
    if (!fs.existsSync(dirDist)) {
      fs.mkdirSync(dirDist);
    }
    if (!fs.existsSync(dirSrcDist)) {
      fs.mkdirSync(dirSrcDist);
    }

    if (!fs.existsSync(dirSrcIcons)) {
      fs.mkdirSync(dirSrcIcons);
    }

    if (!fs.existsSync(dirDistNjs)) {
      fs.mkdirSync(dirDistNjs);
    }

    if (!fs.existsSync(dirDistIcons)) {
      fs.writeFileSync(dirDistIcons, '', 'utf-8');
    }

    if (!fs.existsSync(dirDistSvg)) {
      fs.copyFileSync(dirSrcSvg, dirDistSvg);
    }

    const initialTypeDefinitions = `
import { SVGAttributes } from 'react';
type Icon = (props?: SVGAttributes<SVGElement>) => JSX.Element;

// export icons
`;
    fs.writeFileSync(dirSrcIndex, '', 'utf-8');
    fs.writeFileSync(dirDistIndexD, initialTypeDefinitions, 'utf-8');
  },
  // append export code to icons.js
  appendToIconsIndex: (ComponentNames = []) => {
    let exportString = '';
    let exportTypeString = '';
    [...new Set(ComponentNames)].sort().map((ComponentName) => {
      exportString += `export { default as ${ComponentName} } from './icons/${ComponentName}';\r\n`;
      exportTypeString += `export const ${ComponentName}: Icon;\n`;
    });
    fs.writeFileSync(dirSrcIndex, exportString, 'utf-8');
    fs.appendFileSync(dirDistIndexD, exportTypeString, 'utf-8');
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
