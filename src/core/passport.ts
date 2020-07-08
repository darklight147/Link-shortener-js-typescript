import passport, {PassportStatic} from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import Ipassport from "../helpers/Ipassport.interface"


class Passport {
    public methods: PassportStatic;
	constructor(init: Ipassport) {
		this.methods = passport;
        this.middlewares(init.middlewares);
        this.methods.serializeUser(init.serial);
        this.methods.deserializeUser(init.deserial);
	}

	private middlewares(middleWares: {
		forEach: (arg0: (middleWare: any) => void) => void;
	}) {
		middleWares.forEach((middleWare) => {
			this.methods.use(middleWare);
		});
	}
}

export default Passport