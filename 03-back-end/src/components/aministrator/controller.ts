import BaseController from '../../services/BaseController';
import * as express from 'express';
import AdministratorModel from './model';
import { IAddAdministrator, IAddAdministratorSchemaValidator } from './dto/IAddAdministrator';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditAdministrator, IEditAdministratorSchemaValidator } from './dto/IEditAdministrator';

class AdministratorController extends BaseController {
    async getAll(req: express.Request, res: express.Response, next: express.NextFunction){
        res.send(await this.services.administratorService.getAll());
    }
    
    async getById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id: number = Number(req.params?.id);

        if (!id) {
            res.sendStatus(404);
            return;
        }

        const item: AdministratorModel| null = await this.services.administratorService.getById(id);

        if (item == null) {
            res.sendStatus(404);
            return;
        }

        res.send(item);
    }

    async add(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;

        if (!IAddAdministratorSchemaValidator(item)) {
            res.status(400).send(IAddAdministratorSchemaValidator.errors);
            return;
        }

        const data: IAddAdministrator = item;

        const newAdministrator: AdministratorModel|IErrorResponse = await this.services.administratorService.add(data);

        res.send(newAdministrator);
    }

    async editById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const item = req.body;
        const administratorId = Number(req.params.id);

        if (administratorId <= 0) {
            res.status(400).send(["The administrator ID must be a numerical value larger than 0."]);
            return;
        }

        if (!IEditAdministratorSchemaValidator(item)) {
            res.status(400).send(IEditAdministratorSchemaValidator.errors);
            return;
        }

        const data: IEditAdministrator = item;

        const editedAdministrator: AdministratorModel|IErrorResponse = await this.services.administratorService.edit(administratorId, data);

        res.send(editedAdministrator);

    }

    async deleteById(req: express.Request, res: express.Response, next: express.NextFunction) {
        const administratorId = Number(req.params.id);

        if (administratorId <= 0) {
            res.status(400).send(["The administrator ID must be a numerical value larger than 0."]);
            return;
        }

        res.send(await this.services.administratorService.delete(administratorId));
    }
}

export default AdministratorController;