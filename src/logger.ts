import { createDefaultLogger, Level } from '@tv2media/logger'

export const logger = createDefaultLogger()

export function setupLogger(): void {
	// Hijack console.log:
	// @ts-expect-error
	if (!process.env.DEV) {
		const orgConsoleLog = console.log
		console.log = function (...args: any[]) {
			if (args.length >= 1) {
				try {
					// @ts-expect-error one or more arguments
					logger.debug(args)
				} catch (e) {
					orgConsoleLog('CATCH')
					orgConsoleLog(...args)
					throw e
				}
			}
		}
	}
}

export function setLogLevel(level: keyof typeof Level): void {
	logger.setLevel(Level[level])
}

export function ensureLogLevel(level?: string): keyof typeof Level | undefined {
	return Object.keys(Level).find((l) => l === level) as keyof typeof Level | undefined
}
