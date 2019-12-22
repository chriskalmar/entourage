import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { request } from './request';

axios.defaults.headers.post['Content-Type'] = 'application/json';

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

export const init = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);

  request({
    config,
    query: `
      mutation initProfile(
        $version: String!
        $profile: String!
        $params: JSON!
      ) {
        initProfile(
          version: $version
          profile: $profile
          params: $params
          asyncMode: true
        ) {
          version
        }
      }
    `,
    variables: {
      profile: config.profile,
      params: config.params || {},
      version: argv.versionName,
    },
  });
};
