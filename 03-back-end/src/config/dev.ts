import IConfig from "./IConfig.interface";

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
}

export default Config;