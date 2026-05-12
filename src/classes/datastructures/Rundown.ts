import { RundownSegment } from './Segment.js'

export interface IRundown {
	externalId: string
	name: string
}

export class INewsRundown implements IRundown {
	constructor(
		public externalId: string,
		public name: string,
		public gatewayVersion: string,
		public segments: RundownSegment[] = [],
		public payload: { [key: string]: any } | undefined = undefined
	) {}

	serialize(): IRundown {
		return {
			externalId: this.externalId,
			name: this.name,
		}
	}

	addSegments(segments: RundownSegment[]): void {
		segments.forEach((segment) => {
			this.segments.push(segment)
		})
	}
}
