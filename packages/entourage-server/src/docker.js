import * as compose from 'docker-compose';
import fs from 'fs';
import os from 'os';
import _ from 'lodash';
import {
  getWorkVersionFolder,
  getRandomPorts,
  writeFileSync,
  isEnvFlagSet,
} from './util';
import { parseYamlFile, serializeYamlFile } from './yaml';
import { Docker } from 'docker-cli-js';
import { renderFile } from './render';

const WORK_FOLDER_MOUNT_DESTINATION = '/app/work';

/**
 * @module Docker
 */

/**
 * Check docker-compose file presence
 * @method module:Docker~checkDockerComposeFileExists
 * @param {string} filePath
 * @throws Docker compose file x not found
 */
export const checkDockerComposeFileExists = async filePath => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Docker compose file '${filePath}' not found`);
  }
};

/**
 * Check docker-compose file validity
 * @method module:Docker~validateDockerComposeFile
 * @param {string} cwd
 * @param {string} filePath
 * @throws Docker compose error
 */
export const validateDockerComposeFile = async (cwd, filePath) => {
  checkDockerComposeFileExists(`${cwd}/${filePath}`);

  try {
    await compose.config({ cwd, config: filePath, log: true });
  } catch (error) {
    throw new Error(error.err);
  }
};

/**
 * Update docker-compose file network and ports mapping and generate portRegistry
 * @method module:Docker~adjustDockerComposeFile
 * @param {string} workVersionFolder
 * @param {string} filePath
 * @throws At least one service needs to expose a port
 * @returns {object} portRegistry
 */
export const adjustDockerComposeFile = (workVersionFolder, filePath) => {
  const fullPath = `${workVersionFolder}/${filePath}`;
  const yaml = parseYamlFile(fullPath);

  const portRegistry = {};

  for (const [serviceName, service] of Object.entries(yaml.services)) {
    const { ports, networks } = service;

    if (ports) {
      delete service.ports;

      ports.map(portMapping => {
        const [hostPort, _containerPort] = portMapping.split(':');
        const containerPort = _containerPort || hostPort;

        portRegistry[serviceName] = portRegistry[serviceName] || {};
        portRegistry[serviceName][containerPort] = 0;
      });

      if (!networks) {
        service.networks = [];
      }

      service.networks.push(process.env.NETWORK_NAME);
    }
  }

  if (Object.keys(portRegistry).length < 1) {
    throw new Error('At least one service needs to expose a port');
  }

  yaml.networks = yaml.networks || {};
  yaml.networks[process.env.NETWORK_NAME] = { external: true };

  serializeYamlFile(yaml, fullPath);

  return portRegistry;
};

/**
 * Update docker-compose file
 * @method module:Docker~updateDockerComposeFilesWithPorts
 * @param {string} version
 * @param {object} config
 * @param {object} portRegistry
 */
const updateDockerComposeFilesWithPorts = async (
  version,
  config,
  portRegistry,
) => {
  const workVersionFolder = getWorkVersionFolder(version);

  const templateParams = {
    __PORTS: {},
  };

  for (const [serviceName, service] of Object.entries(portRegistry)) {
    for (const containerPort of Object.keys(service)) {
      const key = `${serviceName}_${containerPort}`;
      templateParams.__PORTS[key] = service[containerPort];
    }
  }

  // TODO: should transform all files from `renderTemplates` config
  const fullPath = `${workVersionFolder}/${config.composeFile}`;
  writeFileSync(fullPath, renderFile(fullPath, templateParams));
};

/**
 * Validate compose-file
 *
 * Convert generated port to random ports
 *
 * Update docker-compose file
 *
 * @method module:Docker~processDockerTask
 * @param {string} version
 * @param {object} config
 * @returns {object} portRegistry
 */
export const processDockerTask = async (version, config) => {
  const workVersionFolder = getWorkVersionFolder(version);

  await validateDockerComposeFile(workVersionFolder, config.composeFile);

  const portRegistry = await adjustDockerComposeFile(
    workVersionFolder,
    config.composeFile,
  );

  let countPorts = 0;
  for (const service of Object.values(portRegistry)) {
    countPorts += Object.keys(service).length;
  }

  const randomPorts = await getRandomPorts(countPorts);

  for (const service of Object.values(portRegistry)) {
    for (const containerPort of Object.keys(service)) {
      service[containerPort] = randomPorts.shift();
    }
  }

  await updateDockerComposeFilesWithPorts(version, config, portRegistry);

  return portRegistry;
};

/**
 * Pull docker-compose file sources
 *
 * @method module:Docker~processDockerTask
 * @param {string} version
 * @param {object} config
 * @throws Docker compose error
 */
export const pullForDockerComposeFile = async (version, config) => {
  const filePath = config.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);

  checkDockerComposeFileExists(workVersionFolder, filePath);

  try {
    await compose.pullAll({
      cwd: workVersionFolder,
      config: filePath,
      log: true,
    });
  } catch (error) {
    throw new Error(error.err);
  }
};

/**
 * Start docker-compose file
 *
 * @method module:Docker~runDockerComposeFile
 * @param {string} cwd
 * @param {string} filePath
 * @throws Docker compose error
 */
export const runDockerComposeFile = async (cwd, filePath) => {
  try {
    await compose.upAll({
      cwd,
      config: filePath,
      log: true,
    });
  } catch (error) {
    throw new Error(error.err);
  }
};

/**
 * Start docker-compose file from a work subfolder
 *
 * @method module:Docker~runWorkVersionDockerComposeFile
 * @param {string} version
 * @param {object} config
 * @returns {Promise<function>} Docker~runDockerComposeFile
 */
export const runWorkVersionDockerComposeFile = async (version, config) => {
  const filePath = config.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);

  checkDockerComposeFileExists(workVersionFolder, filePath);

  return runDockerComposeFile(workVersionFolder, filePath);
};

/**
 * Stop docker-compose file
 *
 * Optionally clean volumes, images and orphans
 *
 * @method module:Docker~downDockerComposeFile
 * @param {string} cwd
 * @param {string} filePath
 * @param {boolean} clean
 * @throws Docker compose error
 */
export const downDockerComposeFile = async (cwd, filePath, clean = false) => {
  try {
    const params = {
      cwd,
      config: filePath,
      log: true,
    };
    if (clean) {
      params.commamdOptions = '-v --rmi all --remove-orphans';
    }
    await compose.down(params);
  } catch (error) {
    throw new Error(error.err);
  }
};

/**
 * Start docker-compose file from a work subfolder
 *
 * Optionally clean volumes, images and orphans
 *
 * @method module:Docker~downWorkVersionDockerComposeFile
 * @param {string} version
 * @param {object} config
 * @param {boolean} clean
 * @returns {Promise<function>} Docker~downDockerComposeFile
 */
export const downWorkVersionDockerComposeFile = async (
  version,
  config,
  clean = false,
) => {
  const filePath = config.docker.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);

  checkDockerComposeFileExists(workVersionFolder, filePath);

  return downDockerComposeFile(workVersionFolder, filePath, clean);
};

export const createDockerNetwork = async () => {
  const docker = new Docker({});

  const { network: networks } = await docker.command('network ls');

  const found = networks.find(({ name }) => name === process.env.NETWORK_NAME);

  if (!found) {
    await docker.command(
      `network create -d bridge ${process.env.NETWORK_NAME}`,
    );
  }
};

/**
 * Get docker-compose stats
 *
 * @method module:Docker~getDockerComposeStats
 * @param {string} cwd
 * @param {string} filePath
 * @returns {Promise<function>} compose.ps
 * @throws Docker compose error
 */
export const getDockerComposeStats = async (cwd, filePath) => {
  try {
    return compose.ps({
      cwd,
      config: filePath,
    });
  } catch (error) {
    throw new Error(error.err);
  }
};

/**
 * Get docker-compose mountpoint
 *
 * @method module:Docker~getWorkFolderMountSource
 * @returns {string}
 * @throws Cannot detect work folder mount point. Are you running Entourage server via docker?
 */
export const getWorkFolderMountSource = async () => {
  const docker = new Docker({});
  const hostname = isEnvFlagSet('ENTOURAGE_DOCKER_MODE')
    ? os.hostname()
    : 'entourage';

  const result = await docker.command(`inspect ${hostname}`);
  const mounts = _.get(result, 'object[0].Mounts');

  if (mounts) {
    const found = mounts.find(
      mount => mount.Destination === WORK_FOLDER_MOUNT_DESTINATION,
    );

    if (found) {
      return found.Type === 'bind' ? found.Source : found.Name;
    }
  }

  throw new Error(
    'Cannot detect work folder mount point. Are you running Entourage server via docker?',
  );
};
