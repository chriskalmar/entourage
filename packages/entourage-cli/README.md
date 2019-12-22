# entourage-cli

> Client for entourage

See repository page [chriskalmar/entourage](https://github.com/chriskalmar/entourage) for more information.

## Install

Using npm:

```sh
npm install entourage-cli
```

or using yarn:

```sh
yarn add entourage-cli
```

## Exmaple use with a CI pipeline

```bash

# initialize profile with the name 'demo'
# using the project's '.entourage.js' file as config
entourage-cli init demo

# meanwhile perform regular CI tasks
# like linting, building and so on

# check if profile is ready for up to 180 seconds before failing
entourage-cli wait demo 180

# collect generated ports and export them as environment variables
# e.g.
# PORT_httpbin_80=37820
# PORT_hello_80=47762
$(entourage-cli env demo)

# use new environment variable to configure your project
# and run integration tests

# clean up entourage server to free up resources
entourage-cli destroy demo

# continue with further CI tasks

```
