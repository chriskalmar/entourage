import { log, getWorkVersionFolder } from './util';
import { executeScript } from './script';
import { getDockerComposeStats } from './docker';
import { getWorkVersionConfig } from './registry';

export const getProfileStats = async (profile, version) => {
  const config = getWorkVersionConfig({ profile, version });

  const filePath = config.docker.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);
  const stats = await getDockerComposeStats(workVersionFolder, filePath);

  return {
    ...config,
    stats: stats.out,
  };
};
