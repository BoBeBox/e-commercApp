import BasePage from '../BasePage/BasePage';
export default class HomePage extends BasePage<{}> {
    renderMain(): JSX.Element {
        return (
            <div className="pageHolder">
                <h1>Home page</h1>
                <p>Not much here yet...</p>
            </div>
        );
    }
}