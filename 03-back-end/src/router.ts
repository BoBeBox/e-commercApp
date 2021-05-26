import * as express from 'express';
import IApplicationResources from './services/IApplicationResources.interface';
import IRouter from './config/IRouter.interface';
export default class Router {
    static setupRoutes(application: express.Application, resources: IApplicationResources, routers: IRouter[]): void {
        for(const route of routers){
            route.setupRoutes(application, resources);
        }
    }
}