import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import {Effect, Schema, Array as A, Order} from "effect"

const rangeSchema = Schema.TemplateLiteralParser(
    Schema.NumberFromString,
    '-',
    Schema.NumberFromString
)

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day5-input.txt', 'utf8')

    const [rangesSection, idsSection] = content.split('\n\n')

    const ranges = rangesSection
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [min, _, max] = Schema.decodeUnknownSync(rangeSchema)(line.trim())
            return [min, max] as [number, number]
        })

    const ingredientIds = idsSection
        .split('\n')
        .filter(line => line.trim())
        .map(line => parseInt(line.trim()))

    const isFresh = (id: number): boolean =>
        ranges.some(([min, max]) => id >= min && id <= max)

    const freshCount = ingredientIds.filter(isFresh).length

    const sorted = A.sort(ranges, Order.mapInput(Order.number, ([min]: [number, number]) => min))
    const merged = A.reduce(
        sorted,
        [] as Array<readonly [number, number]>,
        (acc, [min, max]) =>
            A.match(acc, {
                onEmpty: () => [[min, max] as const],
                onNonEmpty: (ranges) => {
                    const last = ranges[ranges.length - 1]
                    if (min <= last[1] + 1) {
                        return [
                            ...A.take(ranges, ranges.length - 1),
                            [last[0], Math.max(last[1], max)] as const
                        ]
                    } else {
                        return [...ranges, [min, max] as const]
                    }
                }
            })
    )

    const totalFresh = A.reduce(
        merged,
        0,
        (sum, [min, max]) => sum + (max - min + 1)
    )

    console.log(totalFresh)
})
//Part 1: 798
//Part 2: 366181852921027

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))