import IApplicationResources from '../common/IApplicationResources.interface';
import IServices from '../common/IServices.interface';
export default class BaseController {
    private resources: IApplicationResources;

    constructor(resources: IApplicationResources){
        this.resources = resources;
    }
    protected get services(): IServices {
        return this.resources.services;
    }
}