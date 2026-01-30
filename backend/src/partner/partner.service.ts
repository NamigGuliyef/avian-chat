import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { userRequest } from "../auth/req-auth.type";
import { Company } from "../company/model/company.schema";
import { User } from "../user/model/user.schema";
import { Excel } from "../excel/model/excel.schema";
import { SheetRow } from "../excel/model/row-schema";
import { Sheet } from "../excel/model/sheet.schema";
import { Project } from "../project/model/project.schema";
import { Column } from "../excel/model/column.schema";

@Injectable()
export class PartnerService {
    constructor(
        @InjectModel(Excel.name) private excelModel: Model<Excel>,
        @InjectModel(Project.name) private projectModel: Model<Project>,
        @InjectModel(Sheet.name) private sheetModel: Model<Sheet>,
        @InjectModel(SheetRow.name) private sheetRowModel: Model<SheetRow>,
        @InjectModel(Company.name) private companyModel: Model<Company>,
        @InjectModel(Column.name) private columnModel: Model<Column>,
        @Inject(REQUEST) private readonly request: userRequest
    ) { }

    async getPartnerProjects() {
        // Return only projects where the user is a partner
        const projects = await this.projectModel.find({ partners: { $in: [this.request.user._id] }, isDeleted: false })
            .populate([
                { path: 'excelIds', populate: { path: 'sheetIds' } }
            ])
            .select('-agents -supervisors'); // Explicitly exclude agents and supervisors

        return projects.map(project => {
            const p = project.toObject();
            // Remove sensitive counts if they exist
            delete (p as any).agentsCount;
            delete (p as any).supervisorsCount;
            return p;
        });
    }

    async getExcels(projectId: Types.ObjectId) {
        // Ensure the partner has access to this project
        const project = await this.projectModel.findOne({ _id: projectId, partners: { $in: [this.request.user._id] } });
        if (!project) throw new NotFoundException('Project not found or access denied');

        return await this.excelModel.find({ projectId }).populate('sheetIds').select('-agentIds');
    }

    async getSheetsOfExcel(excelId: Types.ObjectId) {
        const excel = await this.excelModel.findById(excelId);
        if (!excel) throw new NotFoundException('Excel not found');

        // Check project access
        const project = await this.projectModel.findOne({ _id: excel.projectId, partners: { $in: [this.request.user._id] } });
        if (!project) throw new NotFoundException('Access denied');

        return await this.sheetModel.find({ excelId }).select('-agentIds');
    }

    async getColumnsOfSheet(sheetId: Types.ObjectId) {
        const sheet = await this.sheetModel.findById(sheetId).populate({
            path: 'columnIds.columnId',
            model: 'Column',
            select: 'name dataKey options type'
        });
        if (!sheet) throw new NotFoundException('Sheet not found');

        return sheet.columnIds;
    }

    async getRows(sheetId: Types.ObjectId, page = 1, limit = 50, skipRows = 0) {
        const skipOffset = (page - 1) * limit + skipRows;

        const [rows, total] = await Promise.all([
            this.sheetRowModel
                .find({ sheetId })
                .sort({ rowNumber: 1 })
                .skip(skipOffset)
                .limit(limit)
                .lean(),
            this.sheetRowModel.countDocuments({ sheetId }),
        ]);

        return { data: rows, total, page, limit };
    }

    async getPartnerTableView(): Promise<any[]> {
        const projects = await this.projectModel
            .find({
                isDeleted: false,
                partners: this.request.user._id
            })
            .select('-agents -supervisors -sheetIds -columnIds');

        const result = await Promise.all(
            projects.map(async (project) => {
                const company = await this.companyModel.findById(project.companyId);
                const excelDocs = await this.excelModel.find({ _id: { $in: project.excelIds } });

                const excelData = await Promise.all(
                    excelDocs.map(async (excel) => {
                        const sheets = await this.sheetModel.find({ excelId: excel._id });

                        const sheetData = await Promise.all(
                            sheets.map(async (sheet) => {
                                const sheetRows = await this.sheetRowModel.find({ sheetId: sheet._id });
                                const columnIds = sheet.columnIds.map(c => c.columnId);
                                const columns = await this.columnModel.find({ _id: { $in: columnIds } });

                                return {
                                    sheetName: sheet.name,
                                    columns: columns.map(c => c.dataKey),
                                    sheetRows: sheetRows.map(r => ({ ...r.data, projectName: project.name })),
                                };
                            })
                        );

                        return {
                            excelName: excel.name,
                            sheets: sheetData,
                        };
                    })
                );

                return {
                    partnerProjects: project.name,
                    company: company?.name,
                    excels: excelData,
                };
            })
        );

        return result;
    }
}
