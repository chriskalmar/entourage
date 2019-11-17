import { renderFile } from './render';
import fs from 'fs';
import path from 'path';

export const renderTemplate = (templateFilename, templateParams) => {
  const filename = templateFilename.startsWith('/')
    ? templateFilename
    : `${path.basename(process.env.PROFILES_PATH)}/${templateFilename}`;

  if (!fs.existsSync(filename)) {
    throw new Error(`Template '${templateFilename}' not found`);
  }

  return renderFile(filename, templateParams);
};

export const renderTemplateToFile = (
  templateFilename,
  templateParams,
  version,
  outputFilename,
) => {
  const renderedTemplate = renderTemplate(templateFilename, templateParams);

  const filename = `${path.basename(
    process.env.WORK_PATH,
  )}/${version}/${outputFilename}`;

  if (!fs.existsSync(path.dirname(filename))) {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  fs.writeFileSync(filename, renderedTemplate, 'utf8');
};
