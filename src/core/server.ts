import express, { Application } from 'express';

import Init from '../helpers/IbaseInit.interface';

class App {
	public app: Application;
	public port: number;
	public io ?: any[];
	private arr: any[];
	constructor(init: Init) {
		this.app = express();
		this.port = init.port;
		this.middlewares(init.middlewares);
	}

	private middlewares(middleWares: {
		forEach: (arg0: (middleWare: any) => void) => void;
	}) {
		middleWares.forEach((middleWare) => {
			this.app.use(middleWare);
		});
	}

	public set(arr: any[]) {
		this.arr = arr;
	}
	public get(): any[] {
		return this.arr;
	}

	public listen() {
		this.app.listen(this.port, (): void => {
			console.log('App listening on http://localhost:' + this.port);
		});
	}
}


export default App;