import { Request, Response } from 'express';
import BaseController from '../../services/BaseController';
import { IAddToCart, IAddToCartValidator } from './dto/IAddCart';
export default class CartController extends BaseController {
    private checkUserIdentity(req: Request, res: Response): boolean {
        if (req.authorized?.role !== "user") {
            res.status(403).send("This action is only available to the user role.");
            return false;
        }

        if (!req.authorized?.id) {
            res.status(403).send("Unknown user identifier.");
            return false;
        }

        return true;
    }

    public async getCurrentUserCart(req: Request, res: Response) {
        if (this.checkUserIdentity(req, res) === false) return;

        const cart = await this.services.cartService.getLatestCartByUserId(req.authorized?.id, {
            loadArticles: true,
            loadUser: true,
        });

        res.send(cart);
    }

    public async addToCart(req: Request, res: Response) {
        if (this.checkUserIdentity(req, res) === false) return;

        if (!IAddToCartValidator(req.body)) {
            return res.status(400).send(IAddToCartValidator.errors);
        }

        const data = req.body as IAddToCart;

        const article = await this.services.articleService.getById(data.articleId);

        if (article === null) {
            return res.status(404).send("Article not found.");
        }

        res.send(await this.services.cartService.addArticleToLatestCartByUserId(req.authorized?.id, data.articleId, data.quantity));
    }

    public async setInCart(req: Request, res: Response) {
        if (this.checkUserIdentity(req, res) === false) return;

        if (!IAddToCartValidator(req.body)) {
            return res.status(400).send(IAddToCartValidator.errors);
        }

        const data = req.body as IAddToCart;

        const article = await this.services.articleService.getById(data.articleId);

        if (article === null) {
            return res.status(404).send("Article not found.");
        }

        res.send(await this.services.cartService.setArticleToLatestCartByUserId(req.authorized?.id, data.articleId, data.quantity));
    }

    public async makeOrder(req: Request, res: Response) {
        if (this.checkUserIdentity(req, res) === false) return;

        const order = await this.services.cartService.makeOrder(req.authorized?.id);

        if (order === null) {
            return res.status(201).send("Empty cart! Cannot make an order.");
        }

        res.send(order);
    }

    public async getAllOrders(req: Request, res: Response) {
        res.send(await this.services.cartService.getAllOrders());
    }

    public async getAllOrdersByUserId(req: Request, res: Response) {
        res.send(await this.services.cartService.getAllOrdersByUserId(+req.params?.uid));
    }

    public async getAllOrdersForCurrentUser(req: Request, res: Response) {
        if (this.checkUserIdentity(req, res) === false) return;

        res.send(await this.services.cartService.getAllOrdersByUserId(req.authorized?.id));
    }
}