import { log, getWorkVersionFolder } from './util';
import { getDockerComposeStats } from './docker';
import { getWorkVersionConfig } from './registry';

export const getProfileStats = async (profile, version) => {
  const config = getWorkVersionConfig({ profile, version });

  if (!config) {
    throw new Error('Unknown profile');
  }

  const filePath = config.docker.composeFile;
  const workVersionFolder = getWorkVersionFolder(version);
  const { out } = config.ready
    ? await getDockerComposeStats(workVersionFolder, filePath)
    : {};

  return {
    ...config,
    stats: out,
  };
};
