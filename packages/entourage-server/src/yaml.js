import yaml from 'js-yaml';
import fs from 'fs';

/**
 * @module Yaml
 */

/**
 * Parse a yaml file content
 * @method module:Yaml~parseYaml
 * @param {string} content
 * @returns {function} yaml.safeLoad
 */
export const parseYaml = content => yaml.safeLoad(content);

/**
 * Parse a yaml file
 * @method module:Yaml~parseYamlFile
 * @param {string} filePath
 * @returns {function} Yaml~parseYaml
 */
export const parseYamlFile = filePath =>
  parseYaml(fs.readFileSync(filePath, 'utf8'));

/**
 * Serialize some content to yaml format
 * @method module:Yaml~serializeYaml
 * @param {any} content
 * @returns {function} yaml.safeDump
 */
export const serializeYaml = content => yaml.safeDump(content);

/**
 * Serialize some content to yaml format and save it as a file
 * @method module:Yaml~serializeYamlFile
 * @param {any} content
 * @param {string} filePath
 * @returns {function} fs.writeFileSync
 */
export const serializeYamlFile = (content, filePath) =>
  fs.writeFileSync(filePath, serializeYaml(content), 'utf8');
