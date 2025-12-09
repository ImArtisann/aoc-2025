import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import {Effect} from "effect"

const parseInstruction = (line: string) => ({
    dir: line[0].toLowerCase() as 'l' | 'r',
    amount: Number(line.slice(1))
})

const zeroCrossings = (start: number, amount: number, dir: 'l' | 'r'): number => {
    if (dir === 'r') {
        return Math.floor((start + amount) / 100)
    } else {
        return Math.floor((amount + (100 - start) % 100) / 100)
    }
}

const nextValue = (start: number, amount: number, dir: 'l' | 'r'): number =>
    dir === 'r'
        ? (start + amount) % 100
        : ((start - amount) % 100 + 100) % 100

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day1-input.txt', 'utf8')

    const { zeroCount } = content
        .split('\n')
        .filter(line => line.trim())
        .map(parseInstruction)
        .reduce(
            (acc, { dir, amount }) => ({
                value: nextValue(acc.value, amount, dir),
                zeroCount: acc.zeroCount + zeroCrossings(acc.value, amount, dir)
            }),
            { value: 50, zeroCount: 0 }
        )

    console.log(`The Password is: ${zeroCount}`)
})

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))