import BasePage, { PageProperties } from "../BasePage/BasePage";

class IContactPageProperties extends PageProperties {
    title: string = "";
    phone: string = "";
    address: string = "";
}

export default class ContactPage extends BasePage<IContactPageProperties> {
    public constructor(props: IContactPageProperties) {
        super(props);
    }

    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>{ this.props.title }</h1>
                <p>
                    We are located at:<br />
                    { this.props.address }
                </p>
                <p>Phone: { this.props.phone }</p>
            </div>
        );
    }
}