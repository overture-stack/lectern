import 'dotenv/config';

interface TestContainersConfig {
	tls: boolean;
}

interface IntegrationTestConfig {
	testContainers: TestContainersConfig;
}

const envConfig: IntegrationTestConfig = {
	testContainers: {
		tls: process.env.TEST_CONTAINER_ENABLE_TLS === 'true',
	},
};

export default envConfig;
