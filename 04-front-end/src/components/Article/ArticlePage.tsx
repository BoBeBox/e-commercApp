import ArticleModel from '../../../../03-back-end/src/components/article/model';
import ArticleService from '../../services/ArticleService';
import BasePage from '../BasePage/BasePage';
import { PageProperties } from '../BasePage/BasePage';
import * as path from 'path';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';
class ArticlePageProperties extends PageProperties {
    match?: {
        params: {
            aid: string;
        }
    }
}
class ArticlePageState {
    data: ArticleModel|null = null;
    quantity: string = "1";
}
export default class ArticlePage extends BasePage<ArticlePageProperties> {
    state: ArticlePageState;

    constructor(props: ArticlePageProperties) {
        super(props);

        this.state = {
            data: null,
            quantity: "1",
        };
    }
    private getArticleId(): number|null {
        const aid = this.props.match?.params.aid;
        return aid ? +(aid) : null;
    }

    private getArticleData() {
        const aId = this.getArticleId();

        if (aId !== null) {
            this.apiGetArticle(aId);
        }
    }
    private apiGetArticle(aId: number) {
        ArticleService.getArticleById(aId)
        .then(result => {
            if (result === null) {
                return this.setState({
                    data: null,
                });
            }

            this.setState({
                data: result,
            });
        });
    }
    componentDidMount() {
        this.getArticleData();
    }
    componentDidUpdate(prevProps: ArticlePageProperties, prevState: ArticlePageState) {
        if (prevProps.match?.params.aid !== this.props.match?.params.aid) {
            this.getArticleData();
        }
    }
    private getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extPart = path.extname(url);
        const namePart = path.basename(url, extPart);
        return directory + "/" + namePart + "-thumb" + extPart;
    }
    renderMain(): JSX.Element {
        return(
            <>
                <h1>
                    <Link to={ "/category/" + (this.state.data?.categoryId ?? '') }>
                        &lt; Back
                    </Link>
                    |
                    { this.state.data?.category?.name }
                </h1>
                <Row>
                    <Col xs={12} md={8}>
                        <Card>
                        {
                                (Array.isArray(this.state.data?.photos) && this.state.data && this.state.data.photos.length > 0) ? (
                                    <>
                                    <Row>
                                        {
                                            this.state.data?.photos.map(photo => (
                                                <Col xs={ 12 } sm={ 6 } md={ 4 } lg={ 3 } key={ "photo-" + photo.photoId }>
                                                    <Card.Img variant="top"
                                                        src={ApiConfig.APP_ROOT + this.getThumbPath(photo.imagePath)} />
                                                </Col>
                                            ))
                                        }
                                    </Row>
                                    </>
                                )
                                : ""
                            }
                            <Card.Body>
                                <Card.Title>
                                    <strong>
                                        { this.state.data?.name }
                                    </strong>
                                </Card.Title>
                                <Card.Text as="div">
                                    <Row>
                                        <Col xs={12} md={ 9 }>
                                            <b>Basic information:</b><br />
                                            { this.state.data?.excerpt }
                                            <hr />
                                            <b>Detailed specification</b><br />
                                            { this.state.data?.description }
                                        </Col>
                                        <Col xs={12} md={ 3 }>
                                            <table className="table">
                                                    <tr>
                                                        <th>Current price:</th>
                                                        <td className="text-right">
                                                            &euro;{ this.state.data?.currentPrice }
                                                        </td>
                                                    </tr>
                                                    {
                                                Array.isArray(this.state.data?.prices) && this.state.data && this.state.data.prices.length >= 2
                                                ? (
                                                    <>
                                                        <tr>
                                                            <th>Old price:</th>
                                                            <td className="text-right">
                                                                &euro;{ this.state.data.prices[this.state.data.prices.length - 2].price }
                                                            </td>
                                                        </tr>
                                                    </>
                                                )
                                                : ""
                                            }
                                            </table>
                                        </Col>
                                    </Row>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title>
                                    <b>Features:</b>
                                </Card.Title>
                                <Card.Text as="div">
                                    <ul>
                                        {
                                            this.state.data?.features.map(
                                                af => (
                                                    <li key={"feature-value-item-" + af.feature.featureId}>
                                                        <b>
                                                            {af.feature.name}
                                                        </b>:{af.value}
                                                    </li>
                                                )
                                            )
                                        }
                                    </ul>
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </>
        );
    }
}