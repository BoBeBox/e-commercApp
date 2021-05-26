import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as fs from "fs";
import Config from "./config/dev";
import CategoryService from './components/category/service';
import CategoryController from './components/category/controller';
import IApplicationResources from './services/IApplicationResources.interface';
import CategoryRouther from './components/category/router';
import path = require("path");

const application: express.Application = express()

fs.mkdirSync(path.dirname(Config.looger.path),{
    mode: 0o755,
    recursive: true,
})

application.use(morgan(":date[iso]\t:remote-addr\t:method\t:url\t:status\t:res[content-lenght] bytes\t:response-time ms", {
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

const resources: IApplicationResources = {};

CategoryRouther.setupRouter(application, resources);

application.use((req, res)=>{
    res.sendStatus(404);
});

application.listen(Config.server.port);