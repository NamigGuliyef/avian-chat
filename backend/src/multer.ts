import { HttpException, HttpStatus } from "@nestjs/common";
import { diskStorage } from "multer";

export const MulterOptionsExcel = {
    fileFilter: (req: any, file: any, cb: any) => {
        const ext = file.mimetype
        if (ext !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return cb(new HttpException('Sadece .xlsx uzantısı  olan fayl yüklənməlidir.', HttpStatus.BAD_REQUEST))
        }
        cb(null, true);
    },
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, './src/public/');
        },
        filename(req, file, callback) {
            callback(null, file.originalname.slice(0, 26) + '.xlsx');
        },
    }),
    limits: { fileSize: 1024 * 1024 * 50 },
};
