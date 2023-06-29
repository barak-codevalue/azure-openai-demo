/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const path = require('path');
const fs = require('fs');

module.exports = (config, context) => {
  // Install additional plugins
  console.log('loading plugins');

  config.output.filename = '[name].js';

  const mainPath = `${path.dirname(config.entry.main[0])}/functions`;
  const files = fs.readdirSync(mainPath);

  files.forEach((file) => {
    const entry = path.parse(file).name;
    config.entry[entry] = {
      import: path.resolve(mainPath, file),
      filename: `functions/${entry}.js`,
    };
  });

  return config;
};
