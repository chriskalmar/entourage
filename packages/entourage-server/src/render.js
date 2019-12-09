import { template } from 'lodash';
import fs from 'fs';

export const render = (content, templateParams, escapePatterns = []) => {
  let escapedContent = content;

  for (const escapePattern of escapePatterns) {
    const pattern = new RegExp(`\\$\\{\\s*(${escapePattern})\\s*\\}`, 'g');
    escapedContent = escapedContent.replace(pattern, '<%= "\\<%= $1 %\\>" %>');
  }

  const compiled = template(escapedContent);
  const result = compiled(templateParams);

  return result;
};

export const renderFile = (filePath, templateParams, escapePatterns) =>
  render(fs.readFileSync(filePath, 'utf8'), templateParams, escapePatterns);
