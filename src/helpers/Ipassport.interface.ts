interface Ipassport {
    middlewares: any[];
    serial: (user: any, done: any) => void;
    deserial: (id: any, done: any) => void;
}

export default Ipassport