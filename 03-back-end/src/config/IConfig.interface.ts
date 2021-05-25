export default interface IConfig {
    server: {
        port: number,
        static: {
            path: string,
            route: string,
            cacheControl: boolean,
            dotfiles: string,
            etag: boolean,
            maxAge: number,
            index: boolean
        },
    },
    looger: {
        path: string,
    },
}