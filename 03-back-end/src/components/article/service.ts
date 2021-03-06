import BaseService from '../../services/BaseServices';
import ArticleModel, { ArticlePhoto, ArticlePrice } from './model';
import IModelAdapterOptions from '../../common/IModelAdapterOprtions.Interface';
import { resolve } from 'path/posix';
import { IAddArticle, IUploadPhoto } from './dto/IAddArticle';
import IErrorResponse from '../../common/IErrorResponse.interface';
import { IEditArticle } from './dto/IEditArticle';
import Config from '../../config/dev';
import * as fs from 'fs';
import * as path from 'path';

class ArticleModelAdapterOptions implements IModelAdapterOptions {
    loadCategory: boolean = false;
    loadFeature: boolean = false;
    loadPrices: boolean = false;
    loadPhotos: boolean = false;
}

class ArticleService extends BaseService<ArticleModel>{
    async adaptToModel(
        data: any,
        options: Partial<ArticleModelAdapterOptions>,
    ): Promise<ArticleModel>{
        const item: ArticleModel = new ArticleModel();

        item.articleId = Number(data?.article_id);
        item.name = data?.name;
        item.excerpt = data?.excerpt;
        item.description = data?.description;
        item.status = data?.status;
        item.isPromoted = data?.is_promoted;
        item.createdAt = data?.created_at;
        item.categoryId = Number(data?.category_id);
        item.currentPrice = await this.getCurrentPriceForArticle(item.articleId);

        if(options.loadCategory && item.categoryId) {
            item.category = await this.services.categoryService.getById(item.categoryId);
        }

        if(options.loadFeature){
            item.features = await this.services.featureService.getAllByArticleId(item.articleId);
        }

        if(options.loadPrices) {
            item.prices = await this.getAllPricesByArticleId(item.articleId);
        }

        if(options.loadPhotos) {
            item.photos = await this.getAllPhotosByArticleId(item.articleId);
        }

        return item;

        
    }

    public async getCurrentPriceForArticle(articleId: number): Promise<number>{
        return new Promise<number>(async resolve =>{
            const sql: string = `SELECT price FROM article_price WHERE article_id = ? ORDER BY created_at DESC LIMIT 1;`;
            const [rows, fields] = await this.db.execute(sql, [articleId]);

            if(!Array.isArray(rows) || rows.length === 0){
                resolve(0);
                return;
            }
            resolve((rows[0] as {price: number})?.price);
        });
    }

    public async getAllPricesByArticleId(articleId: number): Promise<ArticlePrice[]> {
        return new Promise<ArticlePrice[]>(async resolve =>{
            const [rows, fields] = await this.db.execute(
                `SELECT * FROM article_price WHERE article_id = ? ORDER BY created_at ASC;`,
                [articleId],
            );

            if(!Array.isArray(rows) || rows.length === 0){
                resolve([]);
                return;
            }

            const items: ArticlePrice[] = [];

            for(const row of rows as any[]){
                items.push({
                    priceId: row?.article_price_id as number,
                    price: row?.price as number,
                    createdAt: new Date(row?.created_at as string),
                });
            }

            resolve(items);
        });
    }

    public async getAllPhotosByArticleId(articleId: number): Promise<ArticlePhoto[]>{
        return new Promise<ArticlePhoto[]>(async resolve => {
            const [rows, fields] = await this.db.execute(`
            SELECT * FROM photo WHERE article_id = ?;`,
            [articleId,],
            );
            if(!Array.isArray(rows) || rows.length === 0){
                resolve([]);
                return;
            }
            const items: ArticlePhoto[] = [];

            for( const row of rows as any[]){
                items.push({
                    photoId:row?.photo_id as number,
                    imagePath: row?.image_path as string,
                });
            }
            resolve(items);
        });
    }

    public async getByCategoryId(categoryId: number, options: Partial<ArticleModelAdapterOptions> = {}): Promise<ArticleModel[]>{
        return super.getByFieldIdFromTable<ArticleModelAdapterOptions>(
            "article",
            "category_id",
            categoryId,
            options
        );
    }

    public async getById(articleId: number, options: Partial<ArticleModelAdapterOptions> = {}): Promise<ArticleModel|null>{
        return super.getByIdFromTable<ArticleModelAdapterOptions>("article", articleId, options);
    }

    public async add(data: IAddArticle, uploadPhotos: IUploadPhoto[]): Promise<ArticleModel|IErrorResponse>{
        return new Promise<ArticleModel|IErrorResponse>((resolve) => {
            this.db.beginTransaction()
            .then(() => {
                this.db.execute(
                    `INSERT
                        article
                    SET
                        name = ?,
                        category_id = ?,
                        excerpt = ?,
                        description = ?,
                        status = ?,
                        is_promoted = ?,
                        created_at = NOW();`,
                        [
                            data.name,
                            data.categoryId,
                            data.excerpt,
                            data.description,
                            data.status,
                            data.isPromoted ? 1 : 0,
                        ],
                ).then(async(res: any) => {
                    const newArticleId: number = (res[0]?.insertId) as number;

                    const promises = [];
                    
                    //price:
                    promises.push(
                        this.db.execute(
                            `INSERT
                                article_price
                            SET
                                article_id = ?,
                                price = ?,
                                created_at = NOW();`,
                                [
                                    newArticleId,
                                    data.price,
                                ]
                        )
                    );

                    //article features:
                for(const featureValue of data.features){
                    promises.push(
                        this.db.execute(
                            `INSERT
                                article_feature
                            SET
                                article_id = ?,
                                feature_id = ?,
                                value = ?;`,
                                [
                                    newArticleId,
                                    featureValue.featureId,
                                    featureValue.value
                                ]
                        )
                    );
                }
                //photos
                for(const photo of uploadPhotos){
                    promises.push(
                        this.db.execute(
                            `INSERT
                                photo
                            SET
                                article_id = ?,
                                image_path = ?;`,
                                [
                                    newArticleId,
                                    photo.imagePath,
                                ],
                        )
                    );
                }

                //wait for all pormises to complete

                Promise.all(promises)
                    .then(() => {
                        this.db.commit()
                        .then(async () => {
                            resolve(await this.getById(newArticleId, {
                                loadCategory: true,
                                loadFeature: true,
                                loadPrices: true,
                                loadPhotos: true,
                            }));
                        });
                    })
                    .catch(err => {
                        resolve ({
                            errorCode: err?.errno,
                            message: err?.sqlMessage,
                        });
                    })
                })
                .catch(err=> {
                    resolve({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                        });
                    })
                })

                .catch(err =>{
                    resolve ({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                            
                    });
                });
        });
    }
    
    public async edit(articleId: number, data: IEditArticle): Promise<ArticleModel|IErrorResponse|null> {
        return new Promise<ArticleModel|IErrorResponse>(async(resolve) => {
            const currentArticle = await this.getById(articleId, {
                loadFeature: true,
            });
            if(currentArticle === null){
                resolve(null);
                return;
            }
            this.db.beginTransaction()
            .then(() => {
                this.db.execute(
                    `UPDATE
                        article
                    SET
                        name = ?,
                        excerpt = ?,
                        description = ?,
                        status = ?,
                        is_promoted = ?;`,
                        [
                            data.name,
                            data.excerpt,
                            data.description,
                            data.status,
                            data.isPromoted ? 1 : 0,
                        ],
                ).then(async (res: any) => {
                    const promises = [];

                //Menja cenu samo ako je drugacija od trenutne
                if((+(currentArticle.currentPrice)).toFixed(2) !== (+(data.price)).toFixed(2)){ //poredjenja cena
                    promises.push(
                        this.db.execute(
                            `INSERT
                                article_price
                            SET
                                article_id = ?,
                                price = ?,
                                created_at = NOW();`,
                                [
                                    articleId,
                                    data.price,
                                ]
                        )
                    );
                }
                //uklanjanje features koje nemaju vise vrednost
                const willHaveFeatures = data.features.map(fv => fv.featureId);
                const hasFeatures = currentArticle.features.map(f => f.feature.featureId);

                for(const curruentFeature of hasFeatures){
                    if(!willHaveFeatures.includes(curruentFeature)){
                        promises.push(
                            this.db.execute(
                                `DELETE FROM article_feature
                                WHERE article_id = ? AND feature_id = ?;`,
                                [ articleId, curruentFeature ]
                            )
                        );
                    }
                }
                //menjanje article feature ako ima promena
                for(const featureValue of data.features){
                    promises.push(
                        this.db.execute(
                            `INSERT
                                article_feature
                            SET
                                article_id = ?,
                                feature_id = ?,
                                value = ?
                            ON DUPLICATE KEY
                            UPDATE
                            value = ?;`,
                            [
                                articleId,
                                featureValue.featureId,
                                featureValue.value,
                                featureValue.value,
                            ]
                        )
                    );
                }
                //cekanje promisa
                Promise
                    .all(promises)
                    .then(() => {
                        this.db.commit()
                            .then(async () => {
                                resolve(await this.getById(articleId, {
                                    loadCategory: true,
                                    loadFeature: true,
                                    loadPrices: true,
                                    loadPhotos: true,
                                }));
                            });
                    })
                    .catch(err => {
                        resolve({
                            errorCode: err?.errno,
                            message: err?.sqlMessage,
                        });
                    })
                })
                .catch(err => {
                    resolve({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    message: err?.sqlMessage,
                });
            });
        });
    }

    public async delete(articleId: number): Promise<IErrorResponse>{
        return new Promise<IErrorResponse>(async resolve => {
            const currentArticle = await this.services.articleService.getById(articleId, {
                loadPhotos: true,
            });

            let imagePathsToDelete = [];

            this.db.beginTransaction()
                .then(async () => {
                    if (await this.delateArticlePrices(articleId)) {
                        return;
                    }

                    throw {
                        errno: -100,
                        sqlMessage: 'Could NOT delete prices of articles',
                    };
                })
                .then(async () => {
                    if (await this.delateArticleFeatureValues(articleId)) {
                        return;
                    }

                    throw {
                        errno: -100,
                        sqlMessage: 'Could NOT delete values of articles',
                    };
                })
                .then(async () => {
                    if (await this.delateArticleCartEntries(articleId)) {
                        return;
                    }

                    throw {
                        errno: -100,
                        sqlMessage: 'Could NOT delete records of articles in existing carts.',
                    };
                })
                .then(async () => {
                    const deletedPhotos = await this.delateArticlePhotos(articleId);

                    if (deletedPhotos === false) {
                        throw {
                            errno: -100,
                            sqlMessage: 'Could NOT delete article photos. Files will not be deleted.',
                        };
                    }

                    imagePathsToDelete = deletedPhotos;
                })
                .then(async () => {
                    const result = await this.deleteArticleRecord(articleId);

                    if (result === true) {
                        return;
                    }

                    throw result;
                })
                .then(async () => {
                    await this.db.commit();
                })
                .then(() => {
                    for (const path of imagePathsToDelete) {
                        this.deletePhotoAndResizedVersions(path);
                    }

                    return true;
                })
                .then(() => {
                    resolve({
                        errorCode: 0,
                        message: "Article has been deleted.",
                    });
                })
                .catch(async err => {
                    await this.db.rollback();

                    resolve({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }
    
    private async delateArticlePrices(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM article_price WHERE article_id = ?;`,
                [ articleId,]
            )
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        });
    }

    private async delateArticleFeatureValues(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM article_feature WHERE article_id = ?;`,
                [ articleId, ]
            )
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        });
    }

    private async delateArticlePhotos(articleId: number): Promise<string[]|false> {
        return new Promise<string[]|false>(async resolve => {
            const [ rows ] = await this.db.execute(
                `SELECT image_path FROM photo WHERE article_id = ?;`,
                [ articleId, ]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                resolve([]);
                return;
            }

            const filesToDelete: string[] = (rows as any[]).map(row => row?.image_path as string);

            this.db.execute(
                `DELETE FROM photo WHERE article_id = ?;`,
                [ articleId, ]
            )
            .then(() => {//Brisanje samo iz baze prvo, bez direktorijuma
                resolve(filesToDelete);
            })
            .catch(() => {
                resolve(false);
            });
        });
    }

    private deletePhotoAndResizedVersions(imagePath: string) {
        try {
            fs.unlinkSync(imagePath);

            for (const resizeSpecification of Config.fileUploadOptions.photos.resizings) {
                const parsedFilename = path.parse(imagePath);
                const directory = parsedFilename.dir;
                const namePart  = parsedFilename.name;
                const extPart   = parsedFilename.ext;

                const resizedVersionPath = directory + "/" + namePart + resizeSpecification.sufix + extPart;

                fs.unlinkSync(resizedVersionPath);
            }
        } catch (e) { }
    }

    private async delateArticleCartEntries(articleId: number): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            this.db.execute(
                `DELETE FROM cart_article WHERE article_id = ?;`,
                [ articleId, ]
            )
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        });
    }

    private async deleteArticleRecord(articleId: number): Promise<IErrorResponse|true> {
        return new Promise<IErrorResponse|true>(resolve => {
            this.db.execute(
                `DELETE FROM article WHERE article_id = ?;`,
                [ articleId, ]
            )
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    message: err?.sqlMessage,
                });
            });
        });
    }
    public async deleteArticlePhoto(articleId: number, photoId: number): Promise<IErrorResponse|null> {
        return new Promise<IErrorResponse|null>(async resolve => {
            const article = await this.getById(articleId, {
                loadPhotos: true,
            });

            if (article === null) {
                return resolve(null);
            }

            if (article.photos.length === 1) {
                return resolve({
                    errorCode: -1023,
                    message: 'Cannot delete this photo. An article must have one photo at least.',
                });
            }

            const photos = article.photos.filter(photo => photo.photoId === photoId);

            if (photos.length === 0) {
                return resolve(null);
            }

            const photo = photos[0];

            this.db.execute(
                `DELETE FROM photo WHERE photo_id = ?;`,
                [ photo.photoId, ]
            )
            .then(() => {
                this.deletePhotoAndResizedVersions(photo.imagePath);

                resolve({
                    errorCode: 0,
                    message: 'Photo has been deleted',
                });
            })
            .catch(err => {
                resolve({
                    errorCode: err?.errno,
                    message: err?.sqlMessage,
                });
            });
        });
    }

    public async addArticlePhotos(articleId: number, uploadedPhotos: IUploadPhoto[]): Promise<ArticleModel|IErrorResponse|null> {
        return new Promise<ArticleModel|IErrorResponse|null>(resolve => {
            this.db.beginTransaction()
                .then(() => {
                    const promises = [];

                    for (const photo of uploadedPhotos) {
                        promises.push(
                            this.db.execute(
                                `INSERT photo SET article_id = ?, image_path = ?;`,
                                [ articleId, photo.imagePath, ],
                            )
                        );
                    }

                    Promise
                        .all(promises)
                        .then(async () => {
                            await this.db.commit();
                        })
                        .then(async () => {
                            resolve(await this.getById(articleId, {
                                loadPhotos: true,
                            }));
                        })
                        .catch(err => {
                            throw err;
                        })
                })
                .catch(async err => {
                    await this.db.rollback();

                    resolve({
                        errorCode: err?.errno,
                        message: err?.sqlMessage,
                    });
                });
        });
    }
}

export default ArticleService;