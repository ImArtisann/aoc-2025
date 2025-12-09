import {Effect, Schema} from "effect";
import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"

const ranges = Schema.TemplateLiteralParser(
    Schema.NumberFromString,
    '-',
    Schema.NumberFromString
)

const isInvalidId = (n: number): boolean => {
    const s = String(n)
    const len = s.length
    for (let patternLen = 1; patternLen <= len / 2; patternLen++) {
        if (len % patternLen === 0) {
            const pattern = s.slice(0, patternLen)
            if (pattern.repeat(len / patternLen) === s) {
                return true
            }
        }
    }
    return false
}

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day2-input.txt', 'utf8')

    const sum = content
        .split(',')
        .filter(line => line.trim())
        .flatMap((line) => {
            const [min, _separator, max] = Schema.decodeUnknownSync(ranges)(line.trim())
            const invalidIds: number[] = []
            for (let id = min; id <= max; id++) {
                if (isInvalidId(id)) {
                    invalidIds.push(id)
                }
            }
            return invalidIds
        })
        .reduce((acc, id) => acc + id, 0)

    console.log(sum)
})
//Part 1: 37314786486
//Part 2: 47477053982

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))
