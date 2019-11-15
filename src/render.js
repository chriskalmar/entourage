import { template } from 'lodash';
import fs from 'fs';

export const render = (content, templateParams) => {
  const compiled = template(content);
  const result = compiled(templateParams);

  return result;
};

export const renderFile = (filePath, templateParams) =>
  render(fs.readFileSync(filePath, 'utf8'), templateParams);
