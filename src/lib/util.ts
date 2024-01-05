/**
 * Split an array into chunks of a given size
 * @param array
 * @param chunkSize
 */
 // @typescript-eslint/no-explicit-any
export const sliceArrayIntoChunks = (array: any[], chunkSize: number) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}