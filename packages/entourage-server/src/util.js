import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import portfinder from 'portfinder';
import { snakeCase } from 'lodash';

/**
 * @module Utils
 */

/**
 * Log a message
 * @method module:Utils~log
 * @param {any} msg
 * @returns {function} console.log
 */
// eslint-disable-next-line no-console
export const log = msg => console.log(msg);

/**
 * Create a work folder from WORK_PATH environement variable
 * @method module:Utils~createWorkPathFolder
 * @param {string} version
 */
export const createWorkPathFolder = () => {
  if (!fs.existsSync(path.basename(process.env.WORK_PATH))) {
    fs.mkdirSync(path.basename(process.env.WORK_PATH), { recursive: true });
  }
};

/**
 * Get a work sub folder name from the version and WORK_PATH environement variable
 * @method module:Utils~getWorkVersionFolder
 * @param {string} version
 * @returns {function} path.normalize
 */
export const getWorkVersionFolder = version =>
  path.normalize(
    `${path.basename(process.env.WORK_PATH)}/${snakeCase(version)}`,
  );

/**
 * Check that a work sub folder name is disposed under WORK_PATH
 * @method module:Utils~checkVersionPathBreakout
 * @param {string} version
 * @throws Version x needs to be a child of WORK_PATH
 */
export const checkVersionPathBreakout = version => {
  const folderPath = getWorkVersionFolder(version);

  if (
    !folderPath.startsWith(path.normalize(path.basename(process.env.WORK_PATH)))
  ) {
    throw new Error(
      `Version '${version}' needs to be a child of '${path.basename(
        process.env.WORK_PATH,
      )}}'`,
    );
  }
};

/**
 * Write a file
 * @method module:Utils~writeFileSync
 * @param {string} filename
 * @param {any} content
 * @returns {function} fs.writeFileSync
 */
export const writeFileSync = (filename, content) =>
  fs.writeFileSync(filename, content, 'utf8');

export const lockWorkVersionFolder = version => {
  const folderPath = getWorkVersionFolder(version);
  const filename = `${folderPath}/.lock`;
  writeFileSync(filename, '');
};

export const isWorkVersionFolderLocked = version => {
  const folderPath = getWorkVersionFolder(version);
  const filename = `${folderPath}/.lock`;
  return fs.existsSync(filename);
};

/**
 * Delete a work sub folder by version
 * @method module:Utils~deleteWorkVersionFolder
 * @param {string} version
 */
export const deleteWorkVersionFolder = version => {
  checkVersionPathBreakout(version);

  const folderPath = getWorkVersionFolder(version);

  if (fs.existsSync(folderPath)) {
    rimraf.sync(folderPath);
  }
};

/**
 * Create or reset a work sub folder by version
 * @method module:Utils~createOrResetWorkVersionFolder
 * @param {string} version
 * @throws Version x is already in use
 */
export const createOrResetWorkVersionFolder = version => {
  checkVersionPathBreakout(version);

  if (isWorkVersionFolderLocked(version)) {
    throw new Error(`Version '${version}' is already in use`);
  }

  deleteWorkVersionFolder(version);

  const folderPath = getWorkVersionFolder(version);

  log(JSON.stringify({ folderPath }, null, 2));

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

/**
 * Log a task
 * @method module:Utils~createOrResetWorkVersionFolder
 * @param {string} task
 * @returns {function} Utils~log
 */
export const printTask = task => log(`\n\n[ ${task} ]`);

/**
 * Generate a random port within a declared range
 * @method module:Utils~getRandomPort
 * @param {number} minPort
 * @param {number} maxPort
 * @returns {Promise<function>} portfinder.getPortPromise
 */
export const getRandomPort = async (minPort = 33000, maxPort = 65000) => {
  const randomPort = minPort + Math.floor(Math.random() * (maxPort - minPort));

  return portfinder.getPortPromise({
    port: randomPort,
    stopPort: maxPort,
  });
};

/**
 * Generate an array of `count` random ports within a declared range
 * @method module:Utils~getRandomPorts
 * @param {number} count
 * @param {number} minPort
 * @param {number} maxPort
 * @param {number[]} exclude
 * @returns {Promise<array>}
 * @throws Too many tries to find an open port
 */
export const getRandomPorts = async (
  count = 1,
  minPort = 33000,
  maxPort = 65000,
  exclude = [],
) => {
  const ports = [];
  let trial = 0;

  while (ports.length < count) {
    const port = await getRandomPort(minPort, maxPort);

    if (ports.includes(port) || exclude.includes(port)) {
      trial++;
    } else {
      ports.push(port);
      trial = 0;
    }

    if (trial > 10) {
      throw new Error('Too many tries to find an open port');
    }
  }

  return ports;
};

/**
 * Write profile configuration into the work folder
 * @method module:Utils~storeWorkVersionConfig
 * @param {string} version
 * @param {object} config
 * @returns {Promise<function>} Utils~writeFileSync
 */
export const storeWorkVersionConfig = (version, config) => {
  const filename = `${getWorkVersionFolder(version)}/.entourage.json`;
  const content = JSON.stringify(config, null, 2);

  writeFileSync(filename, content);
};
