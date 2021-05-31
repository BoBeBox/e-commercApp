import BaseController from '../../services/BaseController';
import * as express from 'express';
import UserModel from './model';
import { IAddUser, IAddUserSchemaValidator } from './dto/IAddUser';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditUser, IEditUserSchemaValidator } from './dto/IEditUser';

class UserController extends BaseController {
    async getAll(req: express.Request, res: express.Response, next: express.NextFunction){
        res.send(await this.services.userService.getAll());
    }
    
    async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id: number = Number(req.params?.id);

        if (!id) {
            res.sendStatus(404);
            return;
        }

        const item: UserModel| null = await this.services.userService.getById(id);

        if (item == null) {
            res.sendStatus(404);
            return;
        }

        res.send(item);
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;

        if (!IAddUserSchemaValidator(item)) {
            res.status(400).send(IAddUserSchemaValidator.errors);
            return;
        }

        const data: IAddUser = item;

        const newUser: UserModel|IErrorResponse = await this.services.userService.add(data);

        res.send(newUser);
    }

    async editById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;
        const userId = Number(req.params.id);

        if (userId <= 0) {
            res.status(400).send(["The user ID must be a numerical value larger than 0."]);
            return;
        }

        if (!IEditUserSchemaValidator(item)) {
            res.status(400).send(IEditUserSchemaValidator.errors);
            return;
        }

        const data: IEditUser = item;

        const editedUser: UserModel|IErrorResponse = await this.services.userService.edit(userId, data);

        res.send(editedUser);

    }

    async deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const userId = Number(req.params.id);

        if (userId <= 0) {
            res.status(400).send(["The user ID must be a numerical value larger than 0."]);
            return;
        }

        res.send(await this.services.userService.delete(userId));
    }
}

export default UserController;