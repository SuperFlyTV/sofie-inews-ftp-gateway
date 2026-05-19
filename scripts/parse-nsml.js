#!/usr/bin/env node
'use strict'

/**
 * Parses a local NSML file using the same parser the gateway uses, and outputs
 * the resulting INewsStory JSON. Useful for debugging how the gateway sees a
 * rundown file before actually connecting to Sofie.
 *
 * Usage:
 *   node scripts/parse-nsml.js <path-to-nsml-file>
 *
 * Example:
 *   node scripts/parse-nsml.js ../nsml/sporten.sänd.neo.neo_6.nsml
 */

const fs = require('fs')
const path = require('path')
// eslint-disable-next-line node/no-unpublished-require
const inewsStoryParser = require('../node_modules/@tv2media/inews/dist/inewsStoryParser').default

const nsmlFile = process.argv[2]
if (!nsmlFile) {
	console.error('Usage: node scripts/parse-nsml.js <path-to-nsml-file>')
	process.exit(1)
}

const content = fs.readFileSync(path.resolve(nsmlFile), 'utf-8')

// Each story is its own <nsml>...</nsml> block. Split on the opening tag,
// keeping it as the start of each block.
const blocks = content.split(/(?=<nsml\b)/g).filter((s) => s.trim().length > 0)

console.error(`Found ${blocks.length} story block(s) in ${path.basename(nsmlFile)}`)

async function main() {
	const stories = []
	for (let i = 0; i < blocks.length; i++) {
		try {
			const story = await inewsStoryParser(blocks[i])
			stories.push(story)
		} catch (err) {
			console.error(`Block ${i}: parse error — ${err.message}`)
		}
	}
	console.log(JSON.stringify(stories, null, 2))
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
