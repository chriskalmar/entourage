import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import portfinder from 'portfinder';
import { snakeCase } from 'lodash';

// eslint-disable-next-line no-console
export const log = msg => console.log(msg);

export const createWorkPathFolder = () => {
  if (!fs.existsSync(path.basename(process.env.WORK_PATH))) {
    fs.mkdirSync(path.basename(process.env.WORK_PATH), { recursive: true });
  }
};

export const getWorkVersionFolder = version =>
  path.normalize(
    `${path.basename(process.env.WORK_PATH)}/${snakeCase(version)}`,
  );

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

export const deleteWorkVersionFolder = version => {
  checkVersionPathBreakout(version);

  const folderPath = getWorkVersionFolder(version);

  if (fs.existsSync(folderPath)) {
    rimraf.sync(folderPath);
  }
};

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

export const printTask = task => log(`\n\n[ ${task} ]`);

export const getRandomPort = async (minPort = 33000, maxPort = 65000) => {
  const randomPort = minPort + Math.floor(Math.random() * (maxPort - minPort));

  return await portfinder.getPortPromise({
    port: randomPort,
    stopPort: maxPort,
  });
};

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

export const storeWorkVersionConfig = (version, config) => {
  const filename = `${getWorkVersionFolder(version)}/.entourage.json`;
  const content = JSON.stringify(config, null, 2);

  writeFileSync(filename, content);
};