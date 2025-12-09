import {Effect, Array as A, Stream, Order, Schema} from "effect";
import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"

class EmptyStringError extends Schema.TaggedError<EmptyStringError>()('EmptyStringError', {
    message: Schema.String
}) {}

const findMaxJoltage = (bank: string): Effect.Effect<number, EmptyStringError> =>
    A.match(bank.split(''), {
        onEmpty: () => Effect.fail(new EmptyStringError({ message: 'line was empty' })),
        onNonEmpty: (chars) =>
            Effect.gen(function* () {
                const len = chars.length

                const firstCandidates = A.take(chars, len - 1)
                const [firstDigit, firstPos] = A.reduce(
                    A.map(firstCandidates, (char, i) => [char, i] as const),
                    ['', -1] as readonly [string, number],
                    (best, [char, i]) => char > best[0] ? [char, i] as const : best
                )

                const secondCandidates = A.drop(chars, firstPos + 1)
                const secondDigit = A.reduce(
                    secondCandidates,
                    '',
                    (best, char) => char > best ? char : best
                )

                return parseInt(firstDigit) * 10 + parseInt(secondDigit)
            })
    })

const findBank = (
    acc: string,
    bank: string,
    digits: number,
): Effect.Effect<string, EmptyStringError> => {
    if (digits <= 0) {
        return Effect.succeed(acc)
    }

    const available = bank.slice(0, bank.length - digits + 1)

    return A.match(available.split(''), {
        onEmpty: () => Effect.fail(new EmptyStringError({ message: 'line was empty' })),
        onNonEmpty: (chars) =>
            Effect.gen(function* () {
                const [char, index] = A.reduce(
                    A.map(chars, (char, i) => [char, i] as const),
                    ['\0', -1] as readonly [string, number],
                    (best, [char, i]) => char > best[0] ? [char, i] as const : best
                )

                return yield* findBank(
                    acc + char,
                    bank.slice(index + 1),
                    digits - 1,
                )
            })
    })
}

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day3-input.txt', 'utf8')

    const results = yield* Effect.all(
        content
            .split('\n')
            .filter(line => line.trim())
            // .map(line => findMaxJoltage(line.trim()))
            .map(line => findBank('', line.trim(), 12))
    )

    // const sum = A.reduce(results, 0, (acc, joltage) => acc + joltage)

    const sum = A.reduce(
        results,
        BigInt(0),
        (acc, joltage) => acc + BigInt(joltage)
    )

    console.log(sum.toString())
})
//Part 1: 17244
//Part 2: 171435596092638

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))