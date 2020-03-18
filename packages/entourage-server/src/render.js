import { template } from 'lodash';
import fs from 'fs';

/**
 * @module Render
 */

/**
 * Render a template file by replacing variables
 * @method module:Render~render
 * @param {string} content
 * @param {object} templateParams
 * @param {array} escapePatterns
 * @returns {object}
 */
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

/**
 * Find a template file and render it by replacing variables
 * @method module:Render~renderFile
 * @param {string} content
 * @param {object} templateParams
 * @param {array} escapePatterns
 * @returns {function} Render~render
 */
export const renderFile = (filePath, templateParams, escapePatterns) =>
  render(fs.readFileSync(filePath, 'utf8'), templateParams, escapePatterns);
