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
    logger: {
        path: string,
    },
    database: {
        host: string,
        port: number,
        user: string,
        password: string,
        database: string,
        charset: string,
        timezone: string,
    },
    fileUploadOptions:{
        maxFiles: number,
        maxSize: number,
        tempDirectory: string,
        timeout: number,
        uploadDestinationDirectory: string,
        photos:{
            limits:{
                minWidth: number,
                maxWidth: number,
                minHeight: number,
                maxHeight: number,
            },
            resizings:{
                sufix: string,
                width: number,
                height: number,
                fit: "cover"|"contain",
            }[],
        }
    }
    mail: {
        hostname: string,
        port: number,
        secure: boolean,
        fromEmail: string,
        username: string,
        password: string,
        debug: boolean,
    }
}