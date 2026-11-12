// eslint-disable-next-line n/no-unpublished-import
import baseConfig from '@sofie-automation/code-standard-preset/prettier.config.mjs'

/** @type {import('prettier').Config} */
export default {
	...baseConfig,
	// Pass the plugin as a string specifier: the prettier CLI fails to handle the
	// plugin object (it eagerly enumerates its parsers, which throw for optional,
	// uninstalled peer-dependency plugins such as prettier-plugin-ember-template-tag).
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
}
