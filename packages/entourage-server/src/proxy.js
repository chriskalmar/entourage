import { registry } from './registry';
import { renderFile } from './render';
import { writeFileSync } from './util';
import path from 'path';
import { runDockerComposeFile, getWorkFolderMountSource } from './docker';

let workFolder = '.';

if (Number(process.env.ENTOURAGE_DOCKER_MODE) === 1) {
  getWorkFolderMountSource().then(folder => (workFolder = folder));
}

export const updateProxyConfig = () => {
  const templateParams = {
    services: [],
    hostPorts: [],
    networkName: process.env.NETWORK_NAME,
    workFolder,
  };

  Object.values(registry)
    .sort((a, b) => {
      a.timestamp < b.timestamp;
    })
    .map(config => {
      const { profile, version } = config;

      for (const [serviceName, portMap] of Object.entries(config.ports)) {
        for (const [containerPort, hostPort] of Object.entries(portMap)) {
          templateParams.services.push({
            profile,
            version,
            serviceName,
            containerPort,
            hostPort,
            serverName: `${version}_${serviceName}_1`,
          });

          templateParams.hostPorts.push(hostPort);
        }
      }
    });

  const proxyConfig = renderFile('tpls/haproxy.cfg', templateParams);

  writeFileSync(
    `${path.basename(process.env.WORK_PATH)}/haproxy.cfg`,
    proxyConfig,
  );

  const composeConfig = renderFile(
    'tpls/haproxy.docker-compose.yaml',
    templateParams,
  );

  writeFileSync(
    `${path.basename(process.env.WORK_PATH)}/docker-compose.yaml`,
    composeConfig,
  );
};

export const restartProxy = async () =>
  runDockerComposeFile(
    path.basename(process.env.WORK_PATH),
    'docker-compose.yaml',
  );
