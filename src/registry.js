import fs, { lstatSync } from 'fs';
import path from 'path';
import { log } from 'util';

export const registry = {};

export const addWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  registry[key] = config;
};

export const getWorkVersionConfig = config => {
  const { profile, version } = config;
  const key = `${profile}-${version}`;

  return registry[key];
};

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
