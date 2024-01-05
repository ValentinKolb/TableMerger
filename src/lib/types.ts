export type SheetOptions = {
    skipHeaderRows: number;
    skipFooterRows: number;
    useSheets: string[];
    useColumns: string[];
    minFileAge?: string;
    maxFileAge?: string;
    removeEmptyRows: boolean;
    removeRowsWithEmptyColumn: boolean;
    maxFileCount: number;
    maxFileSizeMB: number;
}

export type Message = {
    type: "success" | "info" | "error" | "warning";
    message: string;
}