export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['dist'],
	testMatch: ['**/*.(spec|test).(ts|js)'],
	moduleNameMapper: {
		'(.+)\\.js$': '$1',
	},
}
