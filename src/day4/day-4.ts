import { FileSystem } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import {Effect} from "effect"

const program = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const content = yield* fs.readFileString('./day4-input.txt', 'utf8')

    const grid = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.split(''))

    const rows = grid.length
    const cols = grid[0]?.length ?? 0

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1],
    ] as const

    const countAdjacentRolls = (row: number, col: number): number => {
        let count = 0
        for (const [dr, dc] of directions) {
            const nr = row + dr
            const nc = col + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (grid[nr][nc] === '@') {
                    count++
                }
            }
        }
        return count
    }

    // let accessibleCount = 0
    //
    // for (let row = 0; row < rows; row++) {
    //     for (let col = 0; col < cols; col++) {
    //         if (grid[row][col] === '@') {
    //             const adjacent = countAdjacentRolls(row, col)
    //             if (adjacent < 4) {
    //                 accessibleCount++
    //             }
    //         }
    //     }
    // }
    //
    // console.log(accessibleCount)

    const findAccessible = (): Array<[number, number]> => {
        const accessible: Array<[number, number]> = []
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (grid[row][col] === '@') {
                    if (countAdjacentRolls(row, col) < 4) {
                        accessible.push([row, col])
                    }
                }
            }
        }
        return accessible
    }

    let totalRemoved = 0

    let accessible = findAccessible()
    while (accessible.length > 0) {
        for (const [row, col] of accessible) {
            grid[row][col] = '.'
            totalRemoved++
        }
        accessible = findAccessible()
    }

    console.log(totalRemoved)
})
//Part 1: 1397
//Part 2: 8758

NodeRuntime.runMain(program.pipe(Effect.provide(NodeContext.layer)))