import fs from 'fs';
import path from 'path';

const readConfig = configPath => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file '${configPath}' not found`);
  }

  const content = require(path.resolve(configPath));

  return typeof content === 'function' ? content() : content;
};

const checkConfig = config => {
  if (typeof config === 'object') {
    if (config.url && config.profile) {
      return true;
    }
  }

  throw new Error('Invalid config');
};

export const init = argv => {
  const config = readConfig(argv.file);
  checkConfig(config);
};
