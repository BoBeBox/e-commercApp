import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';
import BaseService from '../../services/BaseServices';
import { IAddUser } from './dto/IAddUser';
import UserModel from './model';
import IErrorResponse from '../../common/IErrorResponse.interface';
import * as bcrypt from "bcrypt";
import { IEditUser } from './dto/IEditUser';
class UserModelAdapterOptions implements IModelAdapterOptions{
    loadOrders: boolean = false;
}

class UserService extends BaseService<UserModel>{
    async adaptToModel(
        data:any,
        options: Partial<UserModelAdapterOptions>,
    ): Promise<UserModel>{
        const item: UserModel = new UserModel();
        item.userId = Number(data?.user_id);
        item.username = data?.email;
        item.passwordHash = data?.password_hash;
        item.forename = data?.forename;
        item.surname = data?.surname;
        item.phoneNumber = data?.phone_number;
        item.postalAddress = data?.postal_address;

        return item;
    }

    public async getAll(options: Partial<UserModelAdapterOptions> = {}): Promise<UserModel[]> {
        return super.getAllFromTable<UserModelAdapterOptions>("user", options);
    }

    public async getById(id: number, options: Partial<UserModelAdapterOptions> = {}): Promise<UserModel|null> {
        return super.getByIdFromTable<UserModelAdapterOptions>("user", id, options);
    }

    public async add(data: IAddUser): Promise<UserModel|IErrorResponse> {
        return new Promise<UserModel|IErrorResponse>((result) => {

            const passwordHash = bcrypt.hashSync(data.password, 11);//sinhrono hash

            this.db.execute(
                `INSERT
                    user
                SET
                    email = ?,
                    password_hash = ?,
                    forename = ?,
                    surname = ?,
                    phone_number = ?,
                    postal_address = ?;`,
                [
                    data.email,
                    passwordHash,
                    data.forename,
                    data.surname,
                    data.phoneNumber,
                    data.postalAddress,
                ]
            )
                .then(async res => {
                    const resultData: any = res;
                    const newUserId: number = Number(resultData[0]?.insertId);
                    result(await this.getById(newUserId));
                })
                .catch(err => {
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }

    public async edit(userId: number, data: IEditUser): Promise<UserModel|IErrorResponse> {
        return new Promise<UserModel|IErrorResponse>((result) => {

            const passwordHash = bcrypt.hashSync(data.password, 11);

            this.db.execute(`
                UPDATE
                    user
                SET
                    password_hash = ?,
                    forename = ?,
                    surname = ?,
                    phone_number = ?,
                    postal_address = ?
                WHERE
                    user_id = ?;`,
                [
                    passwordHash,
                    data.forename,
                    data.surname,
                    data.phoneNumber,
                    data.postalAddress,
                    userId,
                ]
            )
                .then(async res => {
                    result(await this.getById(userId));
                })
                .catch(err => {
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }

    public async delete(userId: number): Promise<IErrorResponse> {
        return new Promise<IErrorResponse>((result) => {
            const sql: string = "DELETE FROM user WHERE user_id = ?;";

            this.db.execute(sql, [userId])
                .then(async res => {
                    const data: any = res;
                    result({
                        errorCode: 0,
                        message: `Deleted ${data[0].affectedRows} rows.`,
                    });
                })
                .catch(err => {
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }

}

export default UserService;