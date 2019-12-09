import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';
import { renderTemplateToFile } from './template';
import {
  createOrResetWorkVersionFolder,
  // lockWorkVersionFolder,
  printTask,
  log,
  storeWorkVersionConfig,
} from './util';
import { executeScripts } from './script';
import {
  processDockerTask,
  pullForDockerComposeFile,
  runWorkVersionDockerComposeFile,
} from './docker';
import { updateProxyConfig, restartProxy } from './proxy';
import { addWorkVersionConfig, getWorkVersionConfig } from './registry';

export const runProfile = async (profile, params, version, asyncMode) => {
  let profileFilename;

  ['yaml', 'yml'].map(ext => {
    const filename = `${path.basename(
      process.env.PROFILES_PATH,
    )}/${profile}.${ext}`;

    if (fs.existsSync(filename)) {
      profileFilename = filename;
    }
  });

  if (!profileFilename) {
    throw new Error(`Profile '${profile}' not found`);
  }

  let templateParams = {
    ...params,
    __VERSION: version,
    __PROFILE: profile,
  };

  const renderedProfile = renderFile(profileFilename, templateParams);
  const profileYaml = parseYaml(renderedProfile);

  createOrResetWorkVersionFolder(version);

  const { defaults, renderTemplates, prepare, docker } = profileYaml;

  if (defaults) {
    if (defaults.params) {
      templateParams = {
        ...defaults.params,
        ...templateParams,
      };
    }
  }

  if (renderTemplates) {
    printTask('Rendering templates');

    if (renderTemplates.files) {
      renderTemplates.files.map(template => {
        const templateFilename = renderTemplates.sourcePath
          ? `${renderTemplates.sourcePath}/${template}`
          : template;

        const outputFilename = renderTemplates.targetPath
          ? `${renderTemplates.targetPath}/${template}`
          : template;

        renderTemplateToFile(
          templateFilename,
          templateParams,
          version,
          outputFilename,
        );

        log(`✔ ${template}`);
      });
    }
  }

  const versionConfig = {
    timestamp: new Date().getTime(),
    version,
    profile,
    params,
    docker,
    ready: false,
    healthy: false,
  };

  addWorkVersionConfig(versionConfig);

  const runAsync = async () => {
    if (prepare) {
      printTask('Executing \'prepare\'');

      const prepareScriptTimeout = prepare.timeout
        ? Number(prepare.timeout) * 1000
        : 60000;

      if (prepare.script) {
        await executeScripts(
          version,
          prepare.script,
          templateParams,
          prepareScriptTimeout,
        );
      }
    }

    printTask('Executing \'docker\'');
    const portRegistry = await processDockerTask(
      version,
      docker,
      templateParams,
    );

    versionConfig.ports = portRegistry;

    printTask('Storing work version config');

    storeWorkVersionConfig(version, versionConfig);
    addWorkVersionConfig(versionConfig);

    printTask('Pulling containers');
    await pullForDockerComposeFile(version, docker);

    printTask('Starting docker-compose');
    await runWorkVersionDockerComposeFile(version, docker);

    printTask('Updating proxy');
    updateProxyConfig();

    printTask('Restarting proxy');
    restartProxy();

    printTask('Updating work version config');

    versionConfig.ready = true;
    storeWorkVersionConfig(version, versionConfig);
    addWorkVersionConfig(versionConfig);

    // lockWorkVersionFolder(version);
  };

  if (asyncMode) {
    runAsync();
    return versionConfig;
  }

  await runAsync();

  return getWorkVersionConfig(versionConfig);
};
