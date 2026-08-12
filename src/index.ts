import yargs from 'yargs/yargs'

import { Config, Connector } from './connector.js'
import { ensureLogLevel, logger, setLogLevel, setupLogger } from './logger.js'

const argv = yargs(process.argv.slice(2))
	.options({
		host: { type: 'string', default: '127.0.0.1', describe: 'Host of core' },
		port: { type: 'number', default: 3000, describe: 'Port of core' },
		log: { type: 'string', required: false, describe: 'File path to output logs to' },
		id: { type: 'string', required: false, describe: 'Set device Id' },
		token: { type: 'string', required: false, describe: 'Token for core communication' },
		debug: { type: 'boolean', default: false, describe: 'Debug mode' },
		certificates: { type: 'array', string: true, required: false, describe: 'Provide paths to SSL certificates' },
		disableWatchdog: {
			type: 'boolean',
			default: false,
			describe: 'Disable the watchdog (Killing the process if no commands are received after some time)',
		},
		unsafeSSL: {
			type: 'boolean',
			default: false,
			describe: 'Accept all certificates. Not recommended outside of development environments.',
		},
	})
	.help('help').argv

// CLI arguments / Environment variables
const host: string = process.env.CORE_HOST ?? argv.host
const port: number = parseInt(process.env.CORE_PORT + '', 10) || argv.port
const logPath: string = process.env.CORE_LOG ?? argv.log ?? ''
const deviceId: string = process.env.DEVICE_ID ?? argv.id ?? ''
const deviceToken: string = process.env.DEVICE_TOKEN ?? argv.token ?? ''
const disableWatchdog: boolean = process.env.DISABLE_WATCHDOG === '1' || argv.disableWatchdog
const unsafeSSL: boolean = process.env.UNSAFE_SSL === '1' || argv.unsafeSSL
let certs: string[] = process.env.CERTIFICATES ? process.env.CERTIFICATES.split(';').filter((c) => c && c.length) : []
if (!certs.length) {
	certs = argv.certificates ?? []
}
const debug: boolean = argv.debug

setupLogger()
const logLevel = debug ? 'debug' : (ensureLogLevel(process.env.LOG_LEVEL) ?? 'warn')
setLogLevel(logLevel)

// Because the default NodeJS-handler sucks and wont display error properly
process.on('unhandledRejection', (error: any) => {
	logger.data(error).error('Unhandled Promise rejection:')
})
process.on('warning', (error: any) => {
	logger.data(error).warn('Unhandled warning:')
})

logger.info('-----------------------------------')
logger.info('Statup options:')

logger.info(`host: "${host}"`)
logger.info(`port: ${port}`)
logger.info(`log: "${logPath}"`)
logger.info(`id: "${deviceId}"`)
logger.info(`token: "${deviceToken}"`)
logger.info(`certificates: [${certs.join(',')}]`)
logger.info(`disableWatchdog: ${disableWatchdog}`)
logger.info(`unsafeSSL: ${unsafeSSL}`)

logger.info('-----------------------------------')

// App config
const config: Config = {
	process: {
		unsafeSSL: unsafeSSL,
		certificates: certs,
	},
	device: {
		deviceId: deviceId,
		deviceToken: deviceToken,
	},
	core: {
		host: host,
		port: port,
		watchdog: !disableWatchdog,
	},
}

const c = new Connector(logger, config, debug)

logger.info(`Core: ${config.core.host}:${config.core.port}`)
logger.info('-----------------------------------')
c.init().catch(logger.error)
