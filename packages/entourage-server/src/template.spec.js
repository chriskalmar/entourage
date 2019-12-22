import { renderTemplate } from './template';

describe('tempalte', () => {
  it('should render from a template', () => {
    const result = renderTemplate(`${__dirname}/../test/demo-profile.yaml`, {
      __PROFILE: 'blue-space-omlette',
    });

    expect(result).toMatchSnapshot();
  });
});
