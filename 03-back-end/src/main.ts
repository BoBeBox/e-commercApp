import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as fs from "fs";
import * as path from "path";

import Config from "./config/dev";
import IApplicationResources from './common/IApplicationResources.interface';
import CategoryRouther from './components/category/router';
import * as mysql2 from 'mysql2/promise';
import { hostname } from "os";
import Router from './router';
import CategoryService from './components/category/service';
import FeatureService from './components/feature/service';
import FeatureRouter from './components/feature/router';
import ArticleService from './components/article/service';
import ArticleRouter from './components/article/router';
import AdministratorService from './components/aministrator/service';
import AdministratorRouter from './components/aministrator/router';
import UserService from './components/user/service';
import fileUpload = require("express-fileupload");
import UserRouter from "./components/user/router";
import AuthRouter from './components/auth/router';
import CartService from './components/cart/service';
import CartRouter from './components/cart/router';


async function main() {
    const application: express.Application = express()

    fs.mkdirSync(path.dirname(Config.logger.path), {
        mode: 0o755,
        recursive: true
    });

    application.use(morgan(":date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-length] bytes\t:response-time ms", {
        stream: fs.createWriteStream(Config.logger.path),
    }));

    application.use(

        Config.server.static.route,
        express.static(
            Config.server.static.path,
            {
                cacheControl: Config.server.static.cacheControl,
                dotfiles: Config.server.static.dotfiles,
                etag: Config.server.static.etag,
                maxAge: Config.server.static.maxAge,
                index: Config.server.static.index,
            },
        ),

    );

    application.use(cors({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    application.use(express.json());
    application.use(fileUpload({
        limits: {
            fileSize: Config.fileUploadOptions.maxSize,
            files: Config.fileUploadOptions.maxFiles
        },
        tempFileDir: Config.fileUploadOptions.tempDirectory,
        uploadTimeout: Config.fileUploadOptions.timeout,
        useTempFiles: true,
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        createParentPath: true,
    }));
    
    //ako aplikacija ostane ukljucena duze da se ne izgubi konekcija sa bazom
    const databaseConnectionMonitor = (databaseConnection: mysql2.Connection) => {
        databaseConnection.on('error', async error => {
            if (!error.fatal) {
                return;
            }
            if (error.code !== 'PROTOCOL_CONNECTION_LOST') {
                throw error;
            }
            console.log("Reconnectiong to database...");
            databaseConnection = await mysql2.createConnection({
                host: Config.database.host,
                port: Config.database.port,
                user: Config.database.user,
                password: Config.database.password,
                database: Config.database.database,
                charset: Config.database.charset,
                timezone: Config.database.timezone,
                supportBigNumbers: true,
            });
            databaseConnection.connect();
            await new Promise(resolve => setTimeout(resolve, 3000));
            databaseConnectionMonitor(databaseConnection);
        });
    };

    const databaseConnection = await mysql2.createConnection ({
            host: Config.database.host,
            port: Config.database.port,
            user: Config.database.user,
            password: Config.database.password,
            database: Config.database.database,
            charset: Config.database.charset,
            timezone: Config.database.timezone,
            supportBigNumbers: true,
        });
    databaseConnectionMonitor(databaseConnection);

    databaseConnection.connect();

    const resources: IApplicationResources = {
        databaseConnection: databaseConnection,
    };

    resources.services = {
        categoryService: new CategoryService(resources),
        featureService: new FeatureService(resources),
        articleService: new ArticleService(resources),
        administratorService: new AdministratorService(resources),
        userService: new UserService(resources),
        cartService: new CartService(resources),
    }
    //Rute
    Router.setupRoutes(
        application,
        resources,
        [
            new CategoryRouther(),
            new FeatureRouter(),
            new ArticleRouter(),
            new AdministratorRouter(),
            new UserRouter(),
            new AuthRouter(),
            new CartRouter(),
        ]
    );

    application.use((req, res)=>{
        res.sendStatus(404);
    });

    application.use((err, req, res, next)=>{
        res.status(err.status).send(err.type); //handle errors
    });

    application.listen(Config.server.port);
}

main();