import * as mysql2 from 'mysql2/promise';
import { format } from 'mysql2/promise';
import IModelAdapterOptions from '../common/IModelAdapterOprtions.Interface';
import IModel from '../common/IModel.interface';
import IApplicationResources from '../common/IApplicationResources.interface';
import IServices from '../common/IServices.interface';
export default abstract class BaseService<ReturnModel extends IModel>{
    private resources: IApplicationResources;

    constructor(resources: IApplicationResources){
        this.resources = resources;
    }

    protected get db(): mysql2.Connection{ //ponasa se kao read-only property
        return this.resources.databaseConnection;
    }

    protected get services(): IServices{
        return this.resources.services;
    }

    abstract adaptToModel(
        data: any,
        options:Partial<IModelAdapterOptions>,
    ): Promise<ReturnModel>; //adapter izmedu baze i aplikacije (transformacija podataka)

    protected async getAllFromTable<AdapterOprtions extends IModelAdapterOptions>(
        tableName: string,
        options: Partial<AdapterOprtions>={},

    ): Promise<ReturnModel[]>{
        const items: ReturnModel[] = [];

        const sql: string = `SELECT * FROM ${tableName};`;
        const [rows, fields] = await this.db.execute(sql);

        if(Array.isArray(rows)){
            for(const row of rows){
                items.push(
                    await this.adaptToModel(
                        row,
                        options,
                    )
                );
            }
        }
        return items;
    }

    protected async getByIdFromTable<AdapterOprtions extends IModelAdapterOptions>(
        tableName: string,
        id: number,
        options: Partial<AdapterOprtions> = {},
    ): Promise<ReturnModel|null>{
        const sql: string = `SELECT * FROM ${tableName} WHERE ${tableName}_id = ?;`;
        const [rows, fields] = await this.db.execute(sql, [id]);

        if(!Array.isArray(rows)){
            return null;
        }

        if(rows.length == 0){
            return null;
        }

        return await this.adaptToModel(
            rows[0],
            options,
        );
    }

     protected async getByFieldIdFromTable<AdapterOptions extends IModelAdapterOptions>(
        tableName: string,
        fieldName: string,
        fieldValue: any,
        options: Partial<AdapterOptions> = {},
    ): Promise<ReturnModel[]> {
        const items: ReturnModel[] = [];

        let sql: string = `SELECT * FROM ${tableName} WHERE ${fieldName} = ?;`;

        if (fieldValue === null) {
            sql = `SELECT * FROM ${tableName} WHERE ${fieldName} IS NULL;`;
        }

        const [ rows, fields ] = await this.db.execute(sql, [fieldValue]);

        if (Array.isArray(rows)) {
            for (const row of rows) {
                items.push(
                    await this.adaptToModel(
                        row,
                        options,
                    )
                );
            }
        }

        return items;
    }
}