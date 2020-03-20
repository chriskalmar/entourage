import fs, { lstatSync } from 'fs';
import path from 'path';
import { log } from 'util';

export const registry = {};

/**
 * @module Registry
 */

/**
 * Save a profile configuration in the registry
 * @method module:Registry~addWorkVersionConfig
 * @param {object} config
 */
export const addWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  registry[key] = { ...config };
};

/**
 * Find a profile configuration in the registry
 * @method module:Registry~getWorkVersionConfig
 * @param {object} config
 * @returns {object}
 */
export const getWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  return registry[key];
};

/**
 * Remove a profile configuration in the registry
 * @method module:Registry~removeWorkVersionConfig
 * @param {object} config
 */
export const removeWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  delete registry[key];
};

/**
 * Initialize the registry from existing work subfolder
 * @method module:Registry~initRegistry
 */
export const initRegistry = () => {
  const workPath = path.basename(process.env.WORK_PATH);

  fs.readdirSync(workPath)
    .map(name => path.join(workPath, name))
    .filter(filePath => lstatSync(filePath).isDirectory())
    .map(folderPath => path.join(folderPath, '.entourage.json'))
    .filter(configPath => fs.existsSync(configPath))
    .map(configPath => {
      try {
        log(`Reading config: ${configPath}`);
        const content = fs.readFileSync(configPath, 'utf8');
        addWorkVersionConfig(JSON.parse(content));
      } catch (error) {
        log(error.message);
      }
    });
};
