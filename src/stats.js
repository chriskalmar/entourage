import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';
import { renderTemplateToFile } from './template';
import {
  createOrResetWorkVersionFolder,
  lockWorkVersionFolder,
  printTask,
  log,
  storeWorkVersionConfig,
  getWorkVersionFolder,
} from './util';
import { executeScript } from './script';
import {
  processDockerTask,
  pullForDockerComposeFile,
  runWorkVersionDockerComposeFile,
  getDockerComposeStats,
} from './docker';
import { updateProxyConfig, restartProxy } from './proxy';
import { addWorkVersionConfig, getWorkVersionConfig } from './registry';

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
