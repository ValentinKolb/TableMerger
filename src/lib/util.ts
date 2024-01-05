/**
 * Split an array into chunks of a given size
 * @param array
 * @param chunkSize
 */
export const sliceArrayIntoChunks = (array: any[], chunkSize: number) => {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        let chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}