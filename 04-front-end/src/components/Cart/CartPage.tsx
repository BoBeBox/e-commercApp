import { Button, Card } from "react-bootstrap";
import CartModel from "../../../../03-back-end/src/components/cart/model";
import EventRegister from "../../api/EventRegister";
import { ApiConfig } from "../../config/api.config";
import CartService from "../../services/CartService";
import BasePage from "../BasePage/BasePage";
import * as path from "path";
import "./CartPage.sass";
import { confirmAlert } from 'react-confirm-alert';

interface CartPageState {
    cart: CartModel|null;
}

export default class CartPage extends BasePage<{}> {
    state: CartPageState;

    constructor(props: any) {
        super(props);

        this.state = {
            cart: null,
        };
    }

    componentDidMount() {
        EventRegister.on("CART_EVENT", this.cartUpdateEventHandler.bind(this));
        this.getCart();
    }

    private cartUpdateEventHandler(data: any) {
        this.getCart();
    }

    private getCart() {
        CartService.getCart()
        .then(res => {
            this.setState({
                cart: res
            });
        });
    }

    private removeFromCart(articleId: number) {
        confirmAlert({
            title: 'Delete item from the cart',
            message: 'Are you sure you want to delete this item from the cart?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        CartService.setToCart(articleId, 0)
                        .then(res => {
                            EventRegister.emit("CART_EVENT", "cart_updated");
                            this.setState({
                                cart: res
                            });
                        });
                    }
                },
                {
                    label: 'No',
                    onClick: () => { }
                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true,
        });
    }

    private getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extPart   = path.extname(url);
        const namePart  = path.basename(url, extPart);
        return directory + "/" + namePart + "-thumb" + extPart;
    }

    renderMain(): JSX.Element {
        if (this.state.cart === null) {
            return (
                <Card>
                    <Card.Header>
                        <Card.Title>
                            <h1>Your shopping cart</h1>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <p>Your shopping cart is empty.</p>
                    </Card.Body>
                </Card>
            );
        }

        return (
            <>
                <Card>
                    <Card.Header>
                        <Card.Title>
                            <h1>Your shopping cart</h1>
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <table className="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th colSpan={2}>Article</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Sum</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                { this.state.cart.articles.map(ca => (
                                    <tr key={ "cart-article-" + ca.cartArticleId }>
                                        <td>
                                            <img alt={ ca.article.name } className="article-image"
                                                 src={ this.getThumbPath(ApiConfig.APP_ROOT + ca.article.photos[0].imagePath) } />
                                        </td>
                                        <td>
                                            <b>{ ca.article.name }</b><br />
                                            <small>{ ca.article.category?.name }</small>
                                        </td>
                                        <td>&euro; { Number(ca.article?.currentPrice).toFixed(2) }</td>
                                        <td>{ ca.quantity }</td>
                                        <td>&euro; { Number(ca.quantity * ca.article?.currentPrice).toFixed(2) }</td>
                                        <td>
                                            <Button size="sm" variant="danger"
                                                onClick={ () => this.removeFromCart(ca.articleId) }>
                                                &#128465; Delete
                                            </Button>
                                        </td>
                                    </tr>
                                )) }
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4}></td>
                                    <td>
                                        &euro; {
                                            this.state
                                                .cart
                                                .articles
                                                .map(ca => ca.article.currentPrice * ca.quantity)
                                                .reduce((sum, val) => sum + val, 0)
                                                .toFixed(2) }
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </Card.Body>
                </Card>
            </>
        );
    }
}
