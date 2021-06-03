import ArticleModel from "../../../../03-back-end/src/components/article/model";
import * as path from 'path';
import { Col, Card, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ApiConfig } from '../../config/api.config';

interface ArticleItemProperties {
    article: ArticleModel;
}

export default function ArticleItem(props: ArticleItemProperties){
    const article = props.article;

    function getThumbPath(url: string): string {
        const directory = path.dirname(url);
        const extPart   = path.extname(url);
        const namePart  = path.basename(url, extPart);
        return directory + "/" + namePart + "-thumb" + extPart;
    }
    return (
        <Col xs={12} sm={6} md={4} lg={3} className="mb-3">
            <Card key={ "article-cart-" + article.articleId }>
                <Link to={ "/article/" + article.articleId }>
                    <Card.Img variant="top" src={ ApiConfig.APP_ROOT + getThumbPath(article.photos[0]?.imagePath) } />
                </Link>
                <Card.Body>
                    <Card.Title>
                        <Link to={ "/article/" + article.articleId }>
                            { article.name }
                        </Link>
                    </Card.Title>
                    <Card.Text as="div">
                        { article.excerpt }
                    </Card.Text>
                    <Card.Text as="div">
                        <Row>
                            <Col md={12} lg={5} xl={4}>
                                <b>Price</b><br />
                                &euro;{ article.currentPrice }
                            </Col>
                            <Col md={12} lg={7} xl={8}>
                                <b>Features</b><br />
                                {
                                    article.features.map(
                                        af => af.feature.name + ": " + af.value
                                    ).join(", ")
                                }
                            </Col>
                        </Row>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Col>
    )
}