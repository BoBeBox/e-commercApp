import { Component, ReactNode } from "react";
import { Container, Row, Col } from 'react-bootstrap';

export class PageProperties{
    sidebar?: ReactNode
}

export default abstract class BasePage<Properties extends PageProperties> extends Component<Properties> {
    public constructor(
        props: Properties,
    ) {
        super(props);
    }

    render() {
        const sidebarMd = this.props.sidebar ? 3 : 0;
        const sidebarLg = this.props.sidebar ? 4 : 0;

        return (
            <Container>
                <Row>
                    <Col className="page-body" sm={12} md={12 - sidebarMd} lg={12 - sidebarLg}>
                        {this.renderMain()}
                    </Col>
                    <Col className="page-sidebar" sm={12} md={sidebarMd} lg={sidebarLg}>
                        { this.props.sidebar }
                    </Col>
                </Row>
            </Container>
        );
    }

    abstract renderMain(): JSX.Element;
}