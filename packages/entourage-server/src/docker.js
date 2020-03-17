import * as compose from 'docker-compose';
import fs from 'fs';
import os from 'os';
import _ from 'lodash';
import { getWorkVersionFolder, getRandomPorts, writeFileSync } from './util';
import { parseYamlFile, serializeYamlFile } from './yaml';
import { Docker } from 'docker-cli-js';
import { renderFile } from './render';

const WORK_FOLDER_MOUNT_DESTINATION = '/app/work';

export const checkDockerComposeFileExists = async filePath => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Docker compose file '${filePath}' not found`);
  }
};

export const validateDockerComposeFile = async (cwd, filePath) => {
  checkDockerComposeFileExists(`${cwd}/${filePath}`);

  try {
    await compose.config({ cwd, config: filePath, log: true });
  } catch (error) {
    throw new Error(error.err);
  }
};

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

export const runWorkVersionDockerComposeFile = async (version, config) => {
  const filePath = config.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);

  checkDockerComposeFileExists(workVersionFolder, filePath);

  return runDockerComposeFile(workVersionFolder, filePath);
};

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

export const downWorkVersionDockerComposeFile = async (
  version,
  config,
  clean = false,
) => {
  const filePath = config.composeFile;
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

export const getDockerComposeStats = async (cwd, filePath) => {
  try {
    return await compose.ps({
      cwd,
      config: filePath,
    });
  } catch (error) {
    throw new Error(error.err);
  }
};

export const getWorkFolderMountSource = async () => {
  const docker = new Docker({});
  const hostname = 'entourage' || os.hostname();

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
