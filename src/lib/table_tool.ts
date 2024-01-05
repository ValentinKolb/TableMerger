import * as XLSX from "xlsx";
import {sliceArrayIntoChunks} from "./util.ts";
import {SheetOptions} from "./types.ts";
import {showError, showInfo, showSuccess, showWarning} from "./notifications.ts";

type Cell = any
type Row = Cell[]
type Sheet = Row[]

/**
 * Check if the file is an Excel file
 * @param file
 */
const isExcelFile = (file: File) => {
    if ((file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') && !file.name.startsWith("~$")) {
        return true;
    }

    if (!file.name.startsWith(".") && !file.name.startsWith("~$")) {
        showWarning(`Skipping file '${file.webkitRelativePath}' - It is not an excel file.`)
    }

    return false;
}

/**
 * Filter files by age
 * @param file
 * @param settings
 */
const filterFileAge = (file: File, settings: SheetOptions) => {
    if (settings.minFileAge) {
        const minAge = new Date(settings.minFileAge);
        if (file.lastModified < minAge.getTime()) {
            return false;
        }
    }

    if (settings.maxFileAge) {
        const maxAge = new Date(settings.maxFileAge);
        if (file.lastModified > maxAge.getTime()) {
            return false;
        }
    }

    return true;
}

const filterFilesSize = (maxFileSizeMB: number) => (file: File) => {
    const MAX_FILE_SIZE = maxFileSizeMB * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
        showError(`Skipping file '${file.webkitRelativePath}' - It is too large (>${maxFileSizeMB}MB).`)
        return false;
    }
    return true;
}

/**
 * Check if a row has an empty cell
 */
const rowHasEmptyCell = (row: Row, settings: SheetOptions) => {
    const filteredRow = row.filter(cell => cell !== undefined && cell !== null && cell !== "")
    const rowLength = filteredRow.length
    return rowLength < row.length || rowLength < settings.useColumns.length
}

const processFileArray = async (filesArray: File[], setProgress: (v: number) => void, settings: SheetOptions, overallFileCount: number, chunkOffset: number) => {

    const result = [] as Sheet[]

    // read and process each file sequentially
    for (const [index, file] of filesArray.entries()) {
        try {
            const workbook = XLSX.read(await file.arrayBuffer(), {type: 'binary', dense: true})

            const sheets = workbook.SheetNames
                .filter(sheetName => settings.useSheets.length === 0 || settings.useSheets.includes(sheetName))
                .map(sheetName => ({
                    sheetName,
                    sheetData: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1, // convert sheet to array of arrays with this option
                        skipHidden: true, // skip hidden rows
                        blankrows: !settings.removeEmptyRows, // remove empty rows if specified
                    }) as Sheet
                }))

            // warn if sheets are not found
            const notFoundSheets = settings.useSheets.filter(sheet => !sheets.map(s => s.sheetName).includes(sheet))
            if (notFoundSheets.length > 0) {
                showWarning(`Sheet(s) '${notFoundSheets.join(", ")}' not found in file '${file.webkitRelativePath}'`)
            }

            // remove header rows if specified
            sheets.forEach(sheet => sheet.sheetData.splice(0, settings.skipHeaderRows))

            // remove footer rows if specified
            sheets.forEach(sheet => sheet.sheetData.splice(sheet.sheetData.length - settings.skipFooterRows, settings.skipFooterRows))

            // only select columns by letter if specified
            if (settings.useColumns.length > 0) {
                // convert column letters to 0-based numbers
                const useCols = settings.useColumns.map(col => XLSX.utils.decode_col(col))
                // remove all columns by index that are not in useCols
                sheets.forEach(sheet => {
                    sheet.sheetData = sheet.sheetData.map(row => row.filter((_, i) => useCols.includes(i)))
                })
            }

            // remove rows with empty columns if specified
            if (settings.removeRowsWithEmptyColumn && settings.useColumns.length > 0) {
                sheets.forEach(sheet => sheet.sheetData = sheet.sheetData.filter(row => !rowHasEmptyCell(row, settings)))
            }

            // add all sheets to one array
            result.push(
                sheets
                    .map(sheet => sheet.sheetData)
                    .filter(sheet => sheet.length > 0) // remove empty sheets
                    .reduce((acc, val) => acc.concat(val), [])
            )

            // update progress
            setProgress(Math.round(((index + chunkOffset) / overallFileCount) * 100))
            console.log(`Processed ${index + 1 + chunkOffset} of ${overallFileCount} files`)
        } catch (e) {
            showError(`Error reading file ${file.name}: ${(e as Error).message}`)
        }
    }

    // add combined sheets to one array
    const combinedSheetData = result.reduce((acc, val) => acc.concat(val), [])

    // create workbook
    return XLSX.utils.aoa_to_sheet(combinedSheetData)
}

export const progressFiles = async (files: FileList, setProgress: (v: number) => void, settings: SheetOptions) => {

    const filesArray = Array.from(files)
        // filter excel files
        .filter(isExcelFile)
        // filter file age
        .filter(file => filterFileAge(file, settings))
        // filter file size
        .filter(filterFilesSize(settings.maxFileSizeMB))

    setProgress(0)

    const chunkedArray = sliceArrayIntoChunks(filesArray, settings.maxFileCount)

    for (const [index, chunk] of chunkedArray.entries()) {
        const combinedSheet = await processFileArray(chunk, setProgress, settings, filesArray.length, index * settings.maxFileCount)
        const combinedWorkbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(combinedWorkbook, combinedSheet, `Combined-Sheet`)

        if (chunkedArray.length > 1) {
            console.log(`Chunk ${index + 1} of ${Math.ceil(filesArray.length / settings.maxFileCount)} done`)
            showInfo(`Processed ${index + 1} of ${Math.ceil(filesArray.length / settings.maxFileCount)} chunks, downloading will start automatically.`)
        }

        // download workbook
        await downloadWorkbook(combinedWorkbook, chunkedArray.length > 1 ? `Combined-${index + 1}/${chunkedArray.length}.xlsx` : `Combined.xlsx`)

        // wait for download to finish
        console.log(`Waiting for download to finish ... and given gc a chance to clean up`)
        await new Promise(resolve => setTimeout(() => resolve(null), 1_000))
    }

    // update progress
    setProgress(100)

    showSuccess(`Processed ${filesArray.length} files.`)
}

async function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
    // Generate the Excel file (in binary string format)
    const wbout = XLSX.write(workbook, {bookType: 'xlsx', type: 'binary'});

    // Convert the binary string to a Blob
    const blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'});

    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger a download
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    // Append anchor to the body, click it, and remove it
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Wait for the revocation of the object URL
    await new Promise(resolve => setTimeout(() => {
        URL.revokeObjectURL(url)
        resolve(null)
    }, 100))
}

// Convert string to ArrayBuffer
function s2ab(s: string) {
    const buffer = new ArrayBuffer(s.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF; // Convert to UTF-8
    }
    return buffer;
}