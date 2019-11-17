import * as compose from 'docker-compose';
import fs from 'fs';
import { getWorkVersionFolder, getRandomPorts } from './util';
import { parseYamlFile, serializeYamlFile } from './yaml';

export const validateDockerComposeFile = async (cwd, filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Docker compose file '${filePath}' not found`);
  }

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
        let [hostPort, containerPort] = portMapping.split(':');
        containerPort = containerPort || hostPort;

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

export const processDockerTask = async (version, config, params) => {
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

  console.log(JSON.stringify(portRegistry, null, 2));
};
