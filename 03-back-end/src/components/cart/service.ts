import BaseService from '../../services/BaseServices';
import CartModel, { CartArticleModel, OrderModel } from './model';
import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';
import IErrorResponse from '../../common/IErrorResponse.interface';

class CartModelAdapterOptions implements IModelAdapterOptions {
    loadUser: boolean = false;
    loadArticles: boolean = false;
    loadOrder: boolean = false;
}

class CartService extends BaseService<CartModel> {
    async adaptToModel(
        data: any,
        options: Partial<CartModelAdapterOptions>,
    ): Promise<CartModel> {
        const item: CartModel = new CartModel();

        item.cartId = Number(data?.cart_id);
        item.userId = Number(data?.user_id);
        item.createdAt = new Date(data?.created_at);

        if (options.loadUser) {
            item.user = await this.services.userService.getById(item.userId);
        }

        if (options.loadArticles) {
            item.articles = await this.getAllCartArticlesByCartId(item.cartId);
        }

        if (options.loadOrder) {
            item.order = await this.getOrderByCartId(item.cartId);
        }

        return item;
    }

    private async getAllCartArticlesByCartId(cartId: number): Promise<CartArticleModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT * FROM cart_article WHERE cart_id = ?;`,
            [ cartId ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        return await Promise.all(
            (rows as any[]).map(async row => {
                return {
                    cartArticleId: row.cart_article_id,
                    articleId: row.article_id,
                    quantity: row.quantity,
                    article: await this.services.articleService.getById(
                        row.article_id,
                        {
                            loadPhotos: true,
                            loadCategory: true,
                        }
                    ),
                }
            })
        );
    }
    private async getOrderByCartId(cartId: number): Promise<OrderModel>{
        const [ rows ] = await this.db.execute(
            `SELECT * FROM \`order\` WHERE cart_id = ?;`, //rezervisana rec order
            [ cartId ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return null;
        }

        const order = rows[0] as any;

        return {
            orderId: order?.order_id,
            createdAt: new Date(order?.created_at),
            status: order?.status,
        };
    }

    public async getById(cartId: number, options: Partial<CartModelAdapterOptions> = {}): Promise<CartModel|null>{
        return super.getByIdFromTable<CartModelAdapterOptions>("cart", cartId, options);
    }

    private async add(userId: number): Promise<CartModel|IErrorResponse> {
        return new Promise<CartModel|IErrorResponse>((result) => {
            const sql: string = "INSERT cart SET user_id = ?;";

            this.db.execute(sql, [userId])
                .then(async res => {
                    const resultData: any = res;
                    const newCartId: number = Number(resultData[0]?.insertId);
                    result(await this.getById(newCartId, {
                        loadUser: true,
                    }));
                })
                .catch(err => {
                    result({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }

    public async getAllCartsByUserId(userId: number, options: Partial<CartModelAdapterOptions>= {}): Promise<CartModel[]> {
        return await super.getByFieldIdFromTable<CartModelAdapterOptions>("cart", "user_id", userId, options);
    }

    public async getLatestCartByUserId(userId: number, options: Partial<CartModelAdapterOptions> = {}): Promise<CartModel> {
        const [ rows ] = await this.db.execute(
            `SELECT
                cart.cart_id
            FROM
                cart
            LEFT JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            WHERE
                cart.user_id = ?
                AND \`order\`.order_id IS NULL
            ORDER BY
                cart.created_at DESC
            LIMIT
                1;`, //opet rezervisana rec!
            [ userId ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return await this.add(userId) as CartModel;
        }

        return this.getById(
            (rows[0] as any)?.cart_id, {
                loadUser: true,
                loadArticles: true,
            }
        );
    }

    public async addArticleToLatestCartByUserId(userId: number, articleId: number, addQuantity: number): Promise<CartModel> {
        const cart = await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });

        const filteredArticles = cart.articles.filter(a => a.articleId === articleId);

        if (filteredArticles.length === 1) {
            await this.db.execute(
                `UPDATE cart_article SET quantity = quantity + ? WHERE cart_id = ? AND article_id = ?;`,
                [ addQuantity, cart.cartId, articleId, ] //dodavalje u quantity ako artikl postoji
            );
        } else {
            await this.db.execute(
                `INSERT cart_article SET quantity = ?, cart_id = ?, article_id = ?;`,
                [ addQuantity, cart.cartId, articleId, ] //ovde je dodavalje artikla ako ne postoji
            );
        }

        return await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });
    }

    public async setArticleToLatestCartByUserId(userId: number, articleId: number, newQuantity: number): Promise<CartModel> {
        const cart = await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });

        const filteredArticles = cart.articles.filter(a => a.articleId === articleId);

        if (filteredArticles.length === 1) {
            if (newQuantity === 0) {
                await this.db.execute(
                    `DELETE FROM cart_article WHERE cart_id = ? AND article_id = ?;`,
                    [ cart.cartId, articleId, ]
                );
            } else {
                await this.db.execute(
                    `UPDATE cart_article SET quantity = ? WHERE cart_id = ? AND article_id = ?;`,
                    [ newQuantity, cart.cartId, articleId, ]
                );
            }
        } else {
            await this.db.execute(
                `INSERT cart_article SET quantity = ?, cart_id = ?, article_id = ?;`,
                [ newQuantity, cart.cartId, articleId, ] //ubacivanje novog artikla
            );
        }

        return await this.getLatestCartByUserId(userId, {
            loadArticles: true,
        });
    }

    public async makeOrder(userId: number): Promise<CartModel|null|IErrorResponse> {
        return new Promise<CartModel|null|IErrorResponse>(async resolve => {
            let cart = await this.getLatestCartByUserId(userId, {
                loadArticles: true,
                loadUser: true,
            });

            if (cart.articles.length === 0) {
                return resolve(null);
            }

            this.db.execute(
                `INSERT \`order\` SET cart_id = ?;`,
                [ cart.cartId, ]
            )
            .then(async () => {
                resolve(await this.getById(cart.cartId, {
                    loadArticles: true,
                    loadOrder: true,
                    loadUser: true,
                }));
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    message: err?.sqlMessage,
                });
            });
        });
    }

    public async getAllOrders(): Promise<CartModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT * FROM cart
            INNER JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            ORDER BY \`order\`.created_at DESC;`
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        return Promise.all((rows as any[]).map(row => this.adaptToModel(row, {
            loadArticles: true,
            loadOrder: true,
            loadUser: true,
        })));
    }

    public async getAllOrdersByUserId(userId: number): Promise<CartModel[]> {
        const [ rows ] = await this.db.execute(
            `SELECT * FROM cart
            INNER JOIN \`order\` ON \`order\`.cart_id = cart.cart_id
            WHERE cart.user_id = ?
            ORDER BY \`order\`.created_at DESC;`,
            [ userId ]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        return Promise.all((rows as any[]).map(row => this.adaptToModel(row, {
            loadArticles: true,
            loadOrder: true,
            loadUser: true,
        })));
    }
}

export default CartService;