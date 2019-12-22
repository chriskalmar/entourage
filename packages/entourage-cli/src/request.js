import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';

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

    process.exit(1);
  }
};
