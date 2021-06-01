import IRouter from '../../common/IRouter.interface';
import * as express from 'express';
import IApplicationResources from '../../common/IApplicationResources.interface';
import CartController from './controller';
import AuthMiddleware from '../../middleware/auth.middleware';
export default class CartRouter implements IRouter{
    public setupRoutes(application: express.Application, resources: IApplicationResources){
        const cartController: CartController = new CartController(resources);

        application.get(
            "/api/cart",
            AuthMiddleware.getVerifier("user"),
            cartController.getCurrentUserCart.bind(cartController),
        );

        application.post(
            "/api/cart",
            AuthMiddleware.getVerifier("user"),
            cartController.addToCart.bind(cartController),
        );

        application.put(
            "/api/cart",
            AuthMiddleware.getVerifier("user"),
            cartController.setInCart.bind(cartController),
        );

        application.post(
            "/api/cart/order",
            AuthMiddleware.getVerifier("user"),
            cartController.makeOrder.bind(cartController),
        );
    }
}