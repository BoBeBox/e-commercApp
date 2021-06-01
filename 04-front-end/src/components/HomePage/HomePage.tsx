import BasePage from '../BasePage/BasePage';
export default class HomePage extends BasePage<{}> {
    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>BeBox Carpets</h1>
                <p>Dobrodošli!</p>
            </div>
        );
    }
}