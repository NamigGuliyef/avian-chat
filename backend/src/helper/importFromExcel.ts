import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';

async function importFromExcel(sheetId: string, file: Express.Multer.File) {
    const sheet = await this.sheetModel.findById(sheetId);
    if (!sheet) throw new NotFoundException('Sheet tapılmadı');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, {
        defval: null,
    });

    if (!rows.length) {
        throw new BadRequestException('Excel boşdur');
    }

    const lastRow = await this.sheetRowModel
        .findOne({ sheetId })
        .sort({ rowNumber: -1 });

    let rowNumber = lastRow ? lastRow.rowNumber + 1 : 1;

    const docs = rows.map((row) => ({
        sheetId,
        rowNumber: rowNumber++,
        data: row,
    }));

    await this.sheetRowModel.insertMany(docs, { ordered: false });

    return {
        inserted: docs.length,
    };
}
