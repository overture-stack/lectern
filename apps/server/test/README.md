# Server App Testing

## Environment Variables

You do not need to configure any environment variables in order to run the test suite, these are independent of the environment they are run on.

However, depending on the host machine running the tests, there are some configurations that may be needed and can be controlled via environment variables. At the moment, this was setup to handle whether the Docker setup requires TLS enabled.

You only need to enable these settings if required for the environment these are run in. The integration tests should run on your local environment without any manual setup.

| Variable | Values | Default | Description |
|---|---|---|---|
| `TEST_CONTAINER_STARTUP_TIMEOUT_MS` | number | `35000` | Milliseconds to wait for a test container to start before timing out. Increase this on slower CI environments where container startup takes longer than the default. |

