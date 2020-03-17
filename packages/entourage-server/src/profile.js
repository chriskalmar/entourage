import fs from 'fs';
import path from 'path';
import {
  processDockerTask,
  pullForDockerComposeFile,
  runWorkVersionDockerComposeFile,
  downWorkVersionDockerComposeFile,
} from './docker';
import { updateProxyConfig, restartProxy } from './proxy';
import { pubsub } from './pubsub';
import { renderFile } from './render';
import { executeScripts } from './script';
import {
  addWorkVersionConfig,
  getWorkVersionConfig,
  removeWorkVersionConfig,
} from './registry';
import { getProfileConfig } from './stats';
import { renderTemplateToFile } from './template';
import {
  createOrResetWorkVersionFolder,
  // lockWorkVersionFolder,
  printTask,
  log,
  storeWorkVersionConfig,
  deleteWorkVersionFolder,
} from './util';
import { parseYaml } from './yaml';

const getProfileFilename = profile => {
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

  return profileFilename;
};

export const initProfile = async (profile, params, version, asyncMode) => {
  const profileFilename = getProfileFilename(profile);

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

    // TODO: implement health checks
    versionConfig.healthy = true;

    storeWorkVersionConfig(version, versionConfig);
    addWorkVersionConfig(versionConfig);

    // lockWorkVersionFolder(version);

    const eventName = `profileCreated/${profile}/${version}`;
    printTask(`Send ${eventName} event`);
    pubsub.publish(eventName, versionConfig);
  };

  if (asyncMode) {
    runAsync();
    return versionConfig;
  }

  await runAsync();

  return getWorkVersionConfig(versionConfig);
};

export const destroyProfile = async (profile, params, version, asyncMode) => {
  printTask('destroyProfile - Work in progress');
  const versionConfig = await getProfileConfig({ profile, version });

  const profileFilename = getProfileFilename(profile);
  const templateParams = {
    ...params,
    __VERSION: version,
    __PROFILE: profile,
  };
  const renderedProfile = renderFile(profileFilename, templateParams);
  const profileYaml = parseYaml(renderedProfile);
  const { beforeDestroy } = profileYaml;

  const runAsync = async () => {
    if (beforeDestroy) {
      printTask('Executing \'beforeDestroy\'');

      const beforeDestroyScriptTimeout = beforeDestroy.timeout
        ? Number(beforeDestroy.timeout) * 1000
        : 60000;

      if (beforeDestroy.script) {
        await executeScripts(
          version,
          beforeDestroy.script,
          templateParams,
          beforeDestroyScriptTimeout,
        );
      }
    }

    printTask('Stopping docker-compose');
    await downWorkVersionDockerComposeFile(version, versionConfig, true);

    // useless with deleteWorkVersionFolder ?
    // if (renderTemplates) {
    //   printTask('Deleting rendered templates');

    //   if (renderTemplates.files) {
    //     renderTemplates.files.map(template => {
    //       const outputFilename = renderTemplates.targetPath
    //         ? `${renderTemplates.targetPath}/${template}`
    //         : template;

    //       removeRenderedTemplate(version, outputFilename);

    //       log(`✔ ${template}`);
    //     });
    //   }
    // }

    printTask('Removing work version config');
    deleteWorkVersionFolder(version);
    removeWorkVersionConfig(versionConfig);

    printTask('Updating proxy');
    updateProxyConfig();

    printTask('Restarting proxy');
    restartProxy();

    const eventName = `profileDestroyed/${profile}/${version}`;
    printTask(`Send ${eventName} event`);
    pubsub.publish(eventName, versionConfig);
  };

  if (asyncMode) {
    runAsync();
    return versionConfig;
  }

  await runAsync();
  return versionConfig;
};
