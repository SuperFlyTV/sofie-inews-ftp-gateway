import { RundownManager } from '../RundownManager'
import { INewsStoryGW } from '../datastructures/Segment'

const LAYOUT: string = 'n'

let testee: RundownManager

describe('RundownManager', () => {
	beforeEach(() => {
		testee = new RundownManager()
	})

	describe('generateCuesFromLayoutField', () => {
		it('has no layout, dont generate anything', () => {
			const story: INewsStoryGW = createStory()

			const before = { ...story }
			testee.generateCuesFromLayoutField(story)
			expect(story).toEqual(before)
		})

		it('has a layout, designLayout cue is added', () => {
			const story = createStory(LAYOUT)

			expect(story.cues.some((cue) => cue!.some((line) => line.match(/DESIGN_LAYOUT=/i)))).toBeFalsy()
			testee.generateCuesFromLayoutField(story)
			expect(story.cues.some((cue) => cue!.some((line) => line.match(/DESIGN_LAYOUT=/i)))).toBeTruthy()
		})

		it('has the upper cased layout value in the design cue', () => {
			const story: INewsStoryGW = createStory(LAYOUT)

			testee.generateCuesFromLayoutField(story)

			expect(story.cues[0]![0]).toBe(`DESIGN_LAYOUT=${LAYOUT.toUpperCase()}`)
		})

		it('has a layout, link to cue is generated in body', () => {
			const story: INewsStoryGW = createStory(LAYOUT)

			testee.generateCuesFromLayoutField(story)
			expect(story.body).toMatch(/<a(.*?)<\/a>/i)
		})

		it('has one cue already, new cue link references index 1', () => {
			testCorrectCueReferenceInLink(1)
		})

		it('has two cues already, new cue link references index 2', () => {
			testCorrectCueReferenceInLink(2)
		})

		it('has fourteen cues already, new cue link references index 14', () => {
			testCorrectCueReferenceInLink(14)
		})

		it('inserts the cue link right after the first <pi> tag', () => {
			const body: string = `<p><pi></pi></p>\r\n<p></p>\r\n`
			const story = createStory('n', body)

			testee.generateCuesFromLayoutField(story)

			const lines = story.body!.split('\r\n')
			const index = lines.findIndex((line) => line.match('<pi>'))
			expect(lines[index + 1]).toMatch(/<a(.*?)<\/a>/i)
		})

		it('adds a DESIGN_BG to cues', () => {
			const story = createStory(LAYOUT)

			expect(story.cues.some((cue) => cue!.some((line) => line.match(/DESIGN_BG=/i)))).toBeFalsy()
			testee.generateCuesFromLayoutField(story)
			expect(story.cues.some((cue) => cue!.some((line) => line.match(/DESIGN_BG=/i)))).toBeTruthy()
		})

		it('assigns the upper cased layout value to the DESIGN_BG cue', () => {
			const story = createStory(LAYOUT)

			testee.generateCuesFromLayoutField(story)

			expect(
				story.cues.some((cue) => cue!.some((line) => line.match(`DESIGN_BG=${LAYOUT.toUpperCase()}`)))
			).toBeTruthy()
		})

		it('adds link to DESIGN_BG cue', () => {
			const story = createStory(LAYOUT)

			testee.generateCuesFromLayoutField(story)

			const cueIndex = story.cues!.findIndex((cue) => cue!.some((line) => line.match(/DESIGN_BG=/i)))
			expect(story.body!.match(`<a idref="${cueIndex}"><\\/a>`)).toBeTruthy()
		})

		it('mirrors cue links into bodyNodes when present', () => {
			const story = createStory(LAYOUT, `<p><pi>START ITEM</pi></p>\r\n<p></p>\r\n`, [
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'pi', attrs: {}, children: [{ text: 'START ITEM' }] }],
				},
				{ tag: 'p', attrs: {}, children: [] },
			])

			testee.generateCuesFromLayoutField(story)

			expect(story.bodyNodes).toEqual([
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'pi', attrs: {}, children: [{ text: 'START ITEM' }] }],
				},
				// DESIGN_BG is added second, so it lands closest to the <pi> (same as body string)
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'a', attrs: { idref: '1' }, children: [] }],
				},
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'a', attrs: { idref: '0' }, children: [] }],
				},
				{ tag: 'p', attrs: {}, children: [] },
			])
		})

		it('appends cue links to bodyNodes when there is no <pi>', () => {
			const story = createStory(LAYOUT, '<p></p>', [{ tag: 'p', attrs: {}, children: [] }])

			testee.generateCuesFromLayoutField(story)

			expect(story.bodyNodes).toEqual([
				{ tag: 'p', attrs: {}, children: [] },
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'a', attrs: { idref: '0' }, children: [] }],
				},
				{
					tag: 'p',
					attrs: {},
					children: [{ tag: 'a', attrs: { idref: '1' }, children: [] }],
				},
			])
		})
	})
})

function createStory(
	layout?: string,
	body?: string,
	bodyNodes?: INewsStoryGW['bodyNodes']
): INewsStoryGW {
	return {
		id: '',
		identifier: '',
		fields: {
			title: { value: '', attributes: {} },
			modifyDate: { value: '', attributes: {} },
			tapeTime: { value: '', attributes: {} },
			audioTime: { value: '', attributes: {} },
			totalTime: { value: '', attributes: {} },
			cumeTime: { value: '', attributes: {} },
			backTime: { value: '', attributes: {} },
			pageNumber: { value: '', attributes: {} },
			layout: { value: layout ?? '', attributes: {} },
			runsTime: { value: '', attributes: {} },
			videoId: { value: '', attributes: {} },
		},
		body: body ?? '<p></p>',
		bodyNodes,
		cues: [],
		locator: '',
		meta: {},
		attachments: {},
	}
}

function testCorrectCueReferenceInLink(numberOfExistingCues: number): void {
	const story: INewsStoryGW = createStory(LAYOUT)
	for (let i = 0; i < numberOfExistingCues; i++) {
		story.cues.push([`cue${i}`])
	}

	testee.generateCuesFromLayoutField(story)
	expect(story.body!.match(`<a idref="${numberOfExistingCues}"><\\/a>`)).toBeTruthy()
}
