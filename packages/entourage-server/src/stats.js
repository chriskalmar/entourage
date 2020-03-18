import { getWorkVersionFolder } from './util';
import { getDockerComposeStats } from './docker';
import { getWorkVersionConfig } from './registry';

/**
 * @module Stats
 */

/**
 * Retrieve a profile config from the registry
 * @method module:Stats~getProfileConfig
 * @param {string} profile
 * @param {string} version
 * @returns {Promise<object>}
 * @throws Unknown profile
 */
export const getProfileConfig = async (profile, version) => {
  const config = getWorkVersionConfig({ profile, version });

  if (!config) {
    throw new Error('Unknown profile');
  }

  return config;
};

/**
 * Retrieve profile stats from docker compose
 * @method module:Stats~getProfileStats
 * @param {string} profile
 * @param {string} version
 * @returns {Promise<object>}
 * @throws Unknown profile
 */
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

  return out;
};
