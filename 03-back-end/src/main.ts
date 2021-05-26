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


async function main() {


const application: express.Application = express()

fs.mkdirSync(path.dirname(Config.looger.path), {
    mode: 0o755,
    recursive: true
});

application.use(morgan(":date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-length] bytes\t:response-time ms", {
    stream: fs.createWriteStream(Config.looger.path),
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

application.use(cors());
application.use(express.json());

const resources: IApplicationResources = {
    databaseConnection: await mysql2.createConnection({
        host: Config.database.host,
        port: Config.database.port,
        user: Config.database.user,
        password: Config.database.password,
        charset: Config.database.charset,
        timezone: Config.database.timezone,
        supportBigNumbers: true,
    }),
};

resources.databaseConnection.connect();

Router.setupRoutes(
    application,
    resources,
    [
        new CategoryRouther(),
    ]
);
application.use((req, res)=>{
    res.sendStatus(404);
});

application.listen(Config.server.port);
}

main();