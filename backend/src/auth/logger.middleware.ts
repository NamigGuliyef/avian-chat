import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AuditLog } from 'src/logger/model/logger.schema';


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLog>,
    ) { }

    use(req: Request & { user?: any }, res: Response, next: NextFunction) {
        const { method, originalUrl, body } = req;

        // yalnız POST / PATCH / DELETE
        if (!['POST', 'PATCH', 'DELETE'].includes(method)) {
            return next();
        }

        res.on('finish', async () => {
            try {
                // login olmamış user-ləri loglama
                if (!req.user) return;

                const actionField = originalUrl.split('/')[1] || 'unknown';

                const log = new this.auditLogModel({
                    userId: req.user._id,
                    userName: req.user.name,
                    userSurname: req.user.surname,
                    field: actionField,
                    oldValue: method === 'PATCH' ? JSON.stringify(req.body?.old) : null,
                    newValue: JSON.stringify(body),
                });
                await log.save();
            } catch (err) {
                console.error('Audit log error:', err.message);
            }
        });

        next();
    }
}
