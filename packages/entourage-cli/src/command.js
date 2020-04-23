import fs from 'fs';
import path from 'path';
import { request } from './request';
import { subscribe, eventBus } from './subscribe';
import { printProgressDots, sleep } from './util';
import { toUpper, snakeCase } from 'lodash';

const waitRequestInterval = 5000;
const defaultTimeout = 120000;

/**
 * @module Command
 */

/**
 * Read config file (JS | JSON)
 *
 * @method module:Command~readConfig
 * @param {string} configPath
 * @returns {objet} config
 * @throws Config file X not found
 */
const readConfig = configPath => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file '${configPath}' not found`);
  }

  const content = require(path.resolve(configPath));

  return typeof content === 'function' ? content() : content;
};

/**
 * Check config content
 *
 * Validate url, profile and timeout presence
 *
 * @method module:Command~checkConfig
 * @param {object} config
 * @returns {boolean}
 * @throws Invalid config
 */
export const checkConfig = config => {
  if (typeof config === 'object') {
    config.timeout = Number(config.timeout || defaultTimeout);

    if (config.url && config.profile && config.timeout > 0) {
      return true;
    }
  }

  throw new Error('Invalid config');
};

/**
 * Init command
 *
 * Trigger initProfile mutation on entourage-server
 *
 * @method module:Command~init
 * @param {object} argv
 */
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

// const checkReadyness = async ({ config, versionName }) => {
//   const result = await request({
//     config,
//     query: `
//       query getProfileStats(
//         $version: String!
//         $profile: String!
//       ) {
//         getProfileStats(
//           version: $version
//           profile: $profile
//         ) {
//           ready
//           healthy
//         }
//       }
//     `,
//     variables: {
//       profile: config.profile,
//       version: versionName,
//     },
//   });

//   const {
//     getProfileStats: { ready, healthy },
//   } = result;

//   return ready && healthy;
// };

/**
 * Wait command
 *
 * Trigger profileCreated subscription on entourage-server
 *
 * @method module:Command~wait
 * @param {object} argv
 */
export const wait = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);
  const { versionName } = argv;

  const stopProgressDots = printProgressDots();
  let ready = false;
  let timedout = false;

  const eventName = `profileCreated/${config.profile}/${versionName}`;
  console.log(`Waiting entourage server response at ${config.wsUrl} ...`);

  const client = subscribe({
    config,
    eventName,
  });

  eventBus.addListener(eventName, data => {
    // console.log('message received :', args);
    ready = data.ready;
  });

  const timeoutFn = setTimeout(() => {
    timedout = true;
  }, config.timeout);

  while (!ready && !timedout) {
    // ready = await checkReadyness({ config, versionName });
    await sleep(waitRequestInterval);
  }

  stopProgressDots();
  clearTimeout(timeoutFn);
  eventBus.removeAllListeners(eventName);
  client.end(true);

  if (!ready) {
    if (timedout) {
      console.error('Operation timed out');
    }

    console.error('Error: Profile is not ready');
    process.exit(1);
  }
};

/**
 * Destroy command
 *
 * Trigger destroyProfile mutation on entourage-server
 *
 * @method module:Command~destroy
 * @param {object} argv
 */
export const destroy = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);

  console.log(`Contacting entourage server at ${config.url} ...`);

  request({
    config,
    query: `
      mutation destroyProfile(
        $version: String!
        $profile: String!
        $params: JSON!
      ) {
        destroyProfile(
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
      version: argv.versionName,
      params: config.params || {},
    },
  });
};

/**
 * Env command
 *
 * Trigger getProfileStats query on entourage-server
 *
 * @method module:Command~env
 * @param {object} argv
 */
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
      const envVar = toUpper(
        snakeCase(`${prefix}${serviceName}_${definedPort}`),
      );
      console.log(`export ${envVar}=${assignedPort}`);
    }
  }
};
