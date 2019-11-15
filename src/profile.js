import fs from 'fs';
import path from 'path';
import { renderFile } from './render';
import { parseYaml } from './yaml';

export const runProfile = (profile, params) => {
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

  const templateParams = {
    ...params,
    __PROFILE: profile,
  };

  const renderedProfile = renderFile(profileFilename, templateParams);

  const profileYaml = parseYaml(renderedProfile);

  return {};
};
