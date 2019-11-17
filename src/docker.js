import * as compose from 'docker-compose';
import fs from 'fs';
import { getWorkVersionFolder } from './util';
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
  const uniqPorts = [];

  for (const [serviceName, service] of Object.entries(yaml.services)) {
    const { ports, networks } = service;

    if (ports) {
      delete service.ports;

      ports.map(portMapping => {
        let [hostPort, containerPort] = portMapping.split(':');
        containerPort = containerPort || hostPort;

        if (uniqPorts.includes(hostPort)) {
          throw new Error(`Too many services try to use port '${hostPort}'`);
        }

        uniqPorts.push(hostPort);

        portRegistry[serviceName] = portRegistry[serviceName] || {};
        portRegistry[serviceName][hostPort] = containerPort;
      });

      if (!networks) {
        service.networks = [];
      }

      service.networks.push(process.env.NETWORK_NAME);
    }
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
};
