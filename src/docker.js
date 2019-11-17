import * as compose from 'docker-compose';
import fs from 'fs';
import { getWorkVersionFolder } from './util';

export const validateDockerComposeConfig = async (cwd, filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Docker compose file '${filePath}' not found`);
  }

  try {
    await compose.config({ cwd, config: filePath, log: true });
  } catch (error) {
    throw new Error(error.err);
  }
};

export const processDockerTask = async (version, config, params) => {
  const cwd = getWorkVersionFolder(version);

  await validateDockerComposeConfig(cwd, config.composeFile);
};
