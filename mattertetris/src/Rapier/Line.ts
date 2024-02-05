/* Calculate intersection and difference between polygon and lines */

/* Create lines. startX must be lower than endY. */
export function createLines(startY: number, endY: number, thickness: number, x: number = 10000) {
    let lines: number[][][][] = [];
    if (startY >= endY) {
        throw new Error("startX must be lower than endY");
    }

    for (let i = startY; i < endY + thickness; i += thickness) {
        lines.push([[[x, i], [x, i + thickness], [-x, i + thickness], [-x, i], [x, i]]]);
    }
    return lines;
}