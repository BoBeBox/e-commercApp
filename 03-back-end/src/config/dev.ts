import IConfig from "../common/IConfig.interface";

const Config: IConfig = {
    server: {
        port: 40800,
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

    looger: {
        path: "logs/access.log"
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
}

export default Config;