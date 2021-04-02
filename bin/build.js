/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const path = require('path');
const fs = require('fs');
const upperCamelCase = require('uppercamelcase');
const processSvg = require('./processSvg');
const getComponent = require('./getComponent');
const getNjsSymbol = require('./getNjsSymbol');
const pack = require('./pack');
const icons = require('../src/data.json');


// 目标文件夹
const dirDist = path.join(__dirname, '../dist');
const dirDistSvg = path.join(__dirname, '../dist/Svgs.njk');
const dirDistIndexD = path.join(__dirname, '../dist/index.d.ts');
const dirDistIconJSON = path.join(__dirname, '../dist/icons.json');

// 源文件夹
const dirSrc = path.join(__dirname, '../src');
const dirSrcDist = path.join(__dirname, '../src/dist');
const dirSrcIcons = path.join(__dirname, '../src/dist/icons');
const dirSrcSvgsNjk = path.join(__dirname, '../src/Svgs.njk');
const dirSrcIndex = path.join(__dirname, '../src/dist/index.js');

const _api = {
  // generate icon code separately
  generateIconCode: async ({name}) => {
    const ComponentName = `I${upperCamelCase(name)}`;
    // console.log(names);
    const location = path.join(dirSrc, '/svg', `${name}.svg`);
    const code = fs.readFileSync(location);
    const [svgCode, attrs] = await processSvg(code);

    // svg component
    const element = getComponent(ComponentName, svgCode, attrs);
    const destination = path.join(dirSrcIcons, `${ComponentName}.js`);
    fs.writeFileSync(destination, element, 'utf-8');

    // svg nunjucks
    const eleNjs = getNjsSymbol(ComponentName, svgCode, attrs);
    fs.appendFileSync(dirDistSvg, eleNjs, 'utf-8');

    console.log('Successfully built', ComponentName);
    return ComponentName;
  },
  // generate icons.js and icons.d.ts file
  generateIconsIndex: () => {
    // 判断 dist 目录是否存在，没有则创建一个
    if (!fs.existsSync(dirDist)) {
      fs.mkdirSync(dirDist);
    }
    // 判断 src/dist 目录是否存在，没有则创建一个
    if (!fs.existsSync(dirSrcDist)) {
      fs.mkdirSync(dirSrcDist);
    }
    // 判断 src/dist/Icons 目录是否存在，没有则创建一个
    if (!fs.existsSync(dirSrcIcons)) {
      fs.mkdirSync(dirSrcIcons);
    }

    // 拷贝 src/Svgs.njk 到 dist/Svgs.njk
    if (fs.existsSync(dirSrcSvgsNjk)) {
      fs.copyFileSync(dirSrcSvgsNjk, dirDistSvg);
    }

    const initialTypeDefinitions = `type dangerouslySetInnerHTML = {
  __html?: string;
};
type SvgProps = {
  dangerouslySetInnerHTML?: dangerouslySetInnerHTML;
  children?: string;
  viewBox?: string;
  fill?: string;
};

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
      exportTypeString += `export const ${ComponentName}: SvgProps;\n`;
    });
    fs.writeFileSync(dirSrcIndex, exportString, 'utf-8');
    fs.appendFileSync(dirDistIndexD, exportTypeString, 'utf-8');
  },
  getComponentsInfo: async function () {
    const infoComponents = [];
    const iconKeys = Object.keys(icons).map(key => icons[key]);
    for (const {name} of iconKeys) {
      // ignore the icon with '_' start
      // ignore the icon with ':', cause time machine icon with that
      const isIgnore = (name.charAt(0) === '_') || (name.indexOf(':') > -1 );
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
    pack(path.join(dirSrc, '/svg'), dirDistIconJSON)
  },
};

_api.init();
