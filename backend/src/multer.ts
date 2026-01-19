import { HttpException, HttpStatus } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const MulterOptionsExcel = {
  storage: memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new HttpException(
          'Sadəcə .xlsx fayl yüklənməlidir',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }

    cb(null, true);
  },
};
