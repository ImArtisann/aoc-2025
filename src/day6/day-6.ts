import {Effect, Schema, Array as A} from "effect";
import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"

const OperationSchema = Schema.Literal('*', '+')

const NumbersSchema = Schema.Array(Schema.BigIntFromNumber)

class ParseError extends Schema.TaggedError<ParseError>()('ParseError', {
    message: Schema.String
}) {}

const parseProblem = (
    problemCols: Array<string>,
    rows: number
): Effect.Effect<bigint, ParseError> =>
    Effect.gen(function* () {
        const numbers: Array<bigint> = []
        let operation: '*' | '+' = '+'

        for (const col of problemCols) {
            const opChar = col[rows - 1].trim()
            if (opChar === '*' || opChar === '+') {
                operation = opChar
            }

            const digits = col
                .slice(0, rows - 1)
                .split('')
                .filter(c => c !== ' ')
                .join('')

            if (digits.length > 0) {
                numbers.push(BigInt(digits))
            }
        }

        const op = yield* Schema.decode(OperationSchema)(operation).pipe(
            Effect.mapError(() => new ParseError({ message: `Invalid operation: ${operation}` }))
        )

        return op === '*'
            ? A.reduce(numbers, BigInt(1), (acc, n) => acc * n)
            : A.reduce(numbers, BigInt(0), (acc, n) => acc + n)
    })

const parseGrid = (content: string): Effect.Effect<Array<Array<string>>, ParseError> =>
    Effect.gen(function* () {
        const lines = content.split('\n').filter(line => line.length > 0)

        if (lines.length === 0) {
            return yield* Effect.fail(new ParseError({ message: 'Empty input' }))
        }

        const rows = lines.length
        const cols = Math.max(...lines.map(line => line.length))

        const grid = lines.map(line => line.padEnd(cols))

        const isSeparator = (col: number): boolean => {
            for (let row = 0; row < rows; row++) {
                if (grid[row][col] !== ' ') return false
            }
            return true
        }

        const problems: Array<Array<string>> = []
        let currentProblem: Array<string> = []

        for (let col = 0; col < cols; col++) {
            if (isSeparator(col)) {
                if (currentProblem.length > 0) {
                    problems.push(currentProblem)
                    currentProblem = []
                }
            } else {
                let column = ''
                for (let row = 0; row < rows; row++) {
                    column += grid[row][col]
                }
                currentProblem.push(column)
            }
        }
        if (currentProblem.length > 0) {
            problems.push(currentProblem)
        }

        return problems
    })

const parseGrid2 = (content: string): Effect.Effect<Array<Array<string>>, ParseError> =>
    Effect.gen(function* () {
        const lines = content.split('\n').filter(line => line.length > 0)

        if (lines.length === 0) {
            return yield* Effect.fail(new ParseError({ message: 'Empty input' }))
        }

        const reversedLines = lines.map(line => line.split('').reverse().join(''))

        const rows = reversedLines.length
        const cols = Math.max(...reversedLines.map(line => line.length))

        const grid = reversedLines.map(line => line.padEnd(cols))

        const isSeparator = (col: number): boolean => {
            for (let row = 0; row < rows; row++) {
                if (grid[row][col] !== ' ') return false
            }
            return true
        }

        const problems: Array<Array<string>> = []
        let currentProblem: Array<string> = []

        for (let col = 0; col < cols; col++) {
            if (isSeparator(col)) {
                if (currentProblem.length > 0) {
                    problems.push(currentProblem)
                    currentProblem = []
                }
            } else {
                let column = ''
                for (let row = 0; row < rows; row++) {
                    column += grid[row][col]
                }
                currentProblem.push(column)
            }
        }
        if (currentProblem.length > 0) {
            problems.push(currentProblem)
        }

        return problems
    })

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day6-input.txt', 'utf8')

    const lines = content.split('\n').filter(line => line.length > 0)
    const rows = lines.length

    const problems = yield* parseGrid2(content)

    const results = yield* Effect.all(
        problems.map(problemCols => parseProblem(problemCols, rows))
    )

    const grandTotal = A.reduce(results, BigInt(0), (acc, n) => acc + n)

    console.log(grandTotal.toString())
})
//Part 1: 6371789547734
//Part 2: 11419862653216

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))
