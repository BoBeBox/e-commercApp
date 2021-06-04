import CartModel from '../../../03-back-end/src/components/cart/model';
import api from '../api/api';
import { MemoizeExpiring } from 'typescript-memoize';

export default class CartService {
    @MemoizeExpiring(2000)
    public static getCart(): Promise<CartModel|null> {
        return new Promise<CartModel|null>(resolve => {
            api("get", "/cart", "user")
            .then(res => {
                if (res?.status !== "ok") return resolve(null);
                resolve(res.data as CartModel);
            });
        });
    }

    public static addToCart(articleId: number, quantity: number): Promise<CartModel|null> {
        return new Promise<CartModel|null>(resolve => {
            api("post", "/cart", "user", {
                articleId: articleId,
                quantity: quantity,
            })
            .then(res => {
                if (res?.status !== "ok") return resolve(null);
                resolve(res.data as CartModel);
            });
        });
    }

    public static setToCart(articleId: number, quantity: number): Promise<CartModel|null> {
        return new Promise<CartModel|null>(resolve => {
            api("put", "/cart", "user", {
                articleId: articleId,
                quantity: quantity,
            })
            .then(res => {
                if (res?.status !== "ok") return resolve(null);
                resolve(res.data as CartModel);
            });
        });
    }
}
