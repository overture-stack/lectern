import 'dotenv/config';

interface TestContainersConfig {
	startupTimeoutMs: number;
}

interface IntegrationTestConfig {
	testContainers: TestContainersConfig;
}

const envConfig: IntegrationTestConfig = {
	testContainers: {
		startupTimeoutMs:
			process.env.TEST_CONTAINER_STARTUP_TIMEOUT_MS ? parseInt(process.env.TEST_CONTAINER_STARTUP_TIMEOUT_MS) : 35_000,
	},
};

export default envConfig;
