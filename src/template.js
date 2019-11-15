import { renderFile } from './render';
import fs from 'fs';
import path from 'path';

export const renderTemplate = (template, templateParams) => {
  const filename = `${path.basename(process.env.PROFILES_PATH)}/${template}`;

  if (!fs.existsSync(filename)) {
    throw new Error(`Template '${template}' not found`);
  }

  return renderFile(filename, templateParams);
};
