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

export const renderTemplateToFile = (
  template,
  templateParams,
  name = 'default',
) => {
  const renderedTemplate = renderTemplate(template, templateParams, name);
  const filename = `${path.basename(
    process.env.WORK_PATH,
  )}/${name}/${template}`;

  if (!fs.existsSync(path.dirname(filename))) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  fs.writeFileSync(filename, renderedTemplate, 'utf8');
};
