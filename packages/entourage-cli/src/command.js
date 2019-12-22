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

  console.log(`Contacting entourage server at ${config.url} ...`);

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

const checkReadyness = async ({ config, versionName }) => {
  const result = await request({
    config,
    query: `
      query getProfileStats(
        $version: String!
        $profile: String!
      ) {
        getProfileStats(
          version: $version
          profile: $profile
        ) {
          ready
          healthy
        }
      }
    `,
    variables: {
      profile: config.profile,
      version: versionName,
    },
  });

  const {
    getProfileStats: { ready, healthy },
  } = result;

  return ready && healthy;
};
export const env = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);

  const { prefix } = argv;

  const result = await request({
    config,
    query: `
      query getProfileStats(
        $version: String!
        $profile: String!
      ) {
        getProfileStats(
          version: $version
          profile: $profile
        ) {
          timestamp
          version
          profile
          params
          docker
          ready
          healthy
          ports
        }
      }
    `,
    variables: {
      profile: config.profile,
      version: argv.versionName,
    },
  });

  const {
    getProfileStats: { ports },
  } = result;

  for (const [serviceName, portMap] of Object.entries(ports)) {
    for (const [definedPort, assignedPort] of Object.entries(portMap)) {
      const envVar = `${prefix}${serviceName}_${definedPort}`;
      console.log(`export ${envVar}=${assignedPort}`);
    }
  }
};
