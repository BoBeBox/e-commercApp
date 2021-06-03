import ArticleModel from '../../../03-back-end/src/components/article/model';
import api from '../api/api';
export default class ArticleService {
    public static getArticlesByCategoryId(cId: number): Promise<ArticleModel[]> {
        return new Promise<ArticleModel[]>(resolve => {
            api("get", "/category/" + cId + "/article", "user")
            .then(res => {
                if(res?.status !== "ok"){
                    return resolve([]);
                }
                resolve(res?.data as ArticleModel[]);
            });
        });
    }
    public static getArticleById(articleId: number): Promise<ArticleModel|null> {
        return new Promise<ArticleModel|null>(resolve => {
            api("get", "/article/" + articleId, "user")
            .then(res => {
                if(res?.status !== "ok"){
                    return resolve(null);
                }
                resolve(res.data as ArticleModel);
            });
        });
    }
}