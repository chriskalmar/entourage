import fs from 'fs';
import path from 'path';
import { request } from './request';
import { subscribe, eventBus } from './subscribe';
import { printProgressDots, sleep } from './util';

const waitRequestInterval = 5000;
const defaultTimeout = 120000;

const readConfig = configPath => {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file '${configPath}' not found`);
  }

  const content = require(path.resolve(configPath));

  return typeof content === 'function' ? content() : content;
};

export const checkConfig = config => {
  if (typeof config === 'object') {
    config.timeout = Number(config.timeout || defaultTimeout);

    if (config.url && config.profile && config.timeout > 0) {
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

const onReadyListener = ({ config, versionName, eventName }) => {
  const wsClient = subscribe({
    config,
    query: `
      subscription profileCreated(
        $version: String!
        $profile: String!
      ) {
        profileCreated(
          version: $version
          profile: $profile
        ) {
          ready
        }
      }
    `,
    variables: {
      profile: config.profile,
      version: versionName,
    },
    eventName,
  });
  return wsClient;
};

export const wait = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);
  const { versionName } = argv;

  const stopProgressDots = printProgressDots();
  let ready = false;
  let timedout = false;

  // create subscription
  const eventName = `${config.profile}-${versionName}-ready`;

  const wsClient = onReadyListener({ config, versionName, eventName });

  eventBus.addListener(eventName, data => {
    ready = data.profileCreated.ready;
    wsClient.close();
  });

  const timeoutFn = setTimeout(() => {
    eventBus.removeListener(eventName);
    wsClient.close();
    timedout = true;
  }, config.timeout);

  while (!ready && !timedout) {
    // ready = await checkReadyness({ config, versionName });
    await sleep(waitRequestInterval);
  }

  stopProgressDots();
  clearTimeout(timeoutFn);

  if (!ready) {
    if (timedout) {
      console.error('Operation timed out');
    }

    console.error('Error: Profile is not ready');
    process.exit(1);
  }
};

export const destroy = async argv => {
  const config = readConfig(argv.file);
  checkConfig(config);
  //   console.log(JSON.stringify(argv, null, 2));

  console.log(`Contacting entourage server at ${config.url} ...`);

  request({
    config,
    query: `
      mutation destroyProfile(
        $version: String!
        $profile: String!
      ) {
        destroyProfile(
          version: $version
          profile: $profile
          asyncMode: true
        ) {
          version
        }
      }
    `,
    variables: {
      profile: config.profile,
      version: argv.versionName,
    },
  });
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
