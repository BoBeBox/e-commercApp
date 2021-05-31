import IConfig from "../common/IConfig.interface";
import * as dotenv from "dotenv";

const envResult = dotenv.config();

if (envResult.error) {
    throw "The environment path with additional information could not be parsed. Error: " + envResult.error;
}

const Config: IConfig = {
    server: {
        port: 40080,
        static: {
            path: "static/",
            route: "/static",
            cacheControl: true,
            dotfiles: "deny",
            etag: true,
            maxAge: 3600000,
            index: false,
        },
    },

    logger: {
        path: "logs/access.log",
    },
    database: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "BeBoX",
        database: "aplikacija",
        charset: "utf8",
        timezone: "+01:00"
    },
    fileUploadOptions:{
        maxSize: 5242880,
        maxFiles: 10,
        tempDirectory: '../temp/',
        timeout: 30000,
        uploadDestinationDirectory: 'static/uploads/',
        photos:{
            limits:{
                minWidth: 320,
                maxWidth: 1920,
                minHeight: 200,
                maxHeight: 1080,
            },
            resizings:[{
                sufix:"-small",
                fit: "cover",
                width: 400,
                height: 300
            },
            {
                sufix:"-thumb",
                fit:"cover",
                width: 250,
                height:200,
            },],
        },
    },
    mail: {
        hostname: process.env?.MAIL_HOST,
        port: +(process.env?.MAIL_PORT),
        secure: process.env?.MAIL_SECURE === "true",
        fromEmail: process.env?.MAIL_FROM,
        username: process.env?.MAIL_USER,
        password: process.env?.MAIL_PASS,
        debug: true,
    }
}

export default Config;