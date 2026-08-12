// eslint-disable-next-line n/no-unpublished-import
import { generateEslintConfig } from '@sofie-automation/code-standard-preset/eslint/main.mjs'

// TODO: test files excluded temporarily — re-enable via tsconfig.eslint.json branch
export default await generateEslintConfig({ ignores: ['src/**/__tests__/**', 'src/**/*.spec.ts'] })
