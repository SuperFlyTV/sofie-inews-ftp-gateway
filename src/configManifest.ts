import { DeviceConfigManifest, JSONBlobStringify, JSONSchema } from '@sofie-automation/server-core-integration'

import ConfigSchema from './$schemas/options.json' with { type: 'json' }

export const INEWS_DEVICE_CONFIG_MANIFEST: DeviceConfigManifest = {
	deviceConfigSchema: JSONBlobStringify<JSONSchema>(ConfigSchema as any),
	subdeviceManifest: {},
}
