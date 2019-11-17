import { registry } from './registry';
import { renderFile } from './render';

export const updateProxyConfig = () => {
  const templateParams = {
    services: [],
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
        }
      }
    });

  renderFile('tpls/haproxy.cfg', templateParams);
};
