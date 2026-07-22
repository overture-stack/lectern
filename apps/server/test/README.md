# Server App Testing

## Environment Variables

You do not need to configure any environment variables in order to run the test suite, these are independent of the environment they are run on.

However, depending on the host machine running the tests, there are some configurations that may be needed and can be controlled via environment variables. At the moment, this was setup to handle whether the Docker setup requires TLS enabled.

You only need to enable these settings if required for the environment these are run in. The integration tests should run on your local environment without any manual setup.

| Variable | Values | Default | Description |
|---|---|---|---|
| `TEST_CONTAINER_ENABLE_TLS` | `true` / `false` | `false` | When `true`, connects to MongoDB with TLS enabled. Useful when running tests against an external TLS-secured MongoDB instead of the testcontainer. |

