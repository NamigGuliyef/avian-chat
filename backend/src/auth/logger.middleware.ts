import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../logger/model/logger.schema';
import { User } from 'src/user/model/user.schema';
import { REQUEST } from '@nestjs/core';

interface IUserBody {
    user: User;
}

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(AuditLog.name)
        private readonly auditLogModel: Model<AuditLog>,
        @Inject(REQUEST) private readonly req: Model<IUserBody>
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
                    userId: req.user.id,
                    userName: req.user.name,
                    userSurname: req.user.surname,
                    method,
                    field: actionField,
                    oldValue: method === 'PATCH' ? JSON.stringify(req.body?.old) : null,
                    newValue: JSON.stringify(body),
                });
                console.log('log', log)
                await log.save();
            } catch (err) {
                console.error('Audit log error:', err.message);
            }
        });

        next();
    }
}
