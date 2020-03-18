import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * @module Request
 */

/**
 * Create a request
 *
 * @method module:Request~request
 * @param {object} req
 * @property {object} req.config
 * @property {string} req.query
 * @property {object} req.variables
 * @returns {object} response
 */
export const request = async ({ config, query, variables }) => {
  try {
    const result = await axios({
      url: config.url,
      method: 'POST',
      json: true,
      data: {
        query,
        variables,
      },
    });

    const body = result.data;

    if (body.errors && body.errors.length) {
      throw new Error(body.errors[0].message);
    }

    return body.data;
  } catch (e) {
    if (e.response) {
      console.error(JSON.stringify(e.response.data, null, 2));
    } else {
      console.error(e.message);
    }

    return process.exit(1);
  }
};
