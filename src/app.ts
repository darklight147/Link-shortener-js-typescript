import mongoose, { Model } from 'mongoose';
import bodyParser from 'body-parser';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import session from 'express-session';
import connectMongo, { MongoStoreFactory } from 'connect-mongo';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';

import Url from './models/url';
import App from './core/server'

// MongoStore(session);
const MongoStore: MongoStoreFactory = connectMongo(session);

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_URI).then(async () => {
	const admin: any = await User.findOne({
		email: 'ADMIN_EMAIL',
	});
	admin.role = 'admin';
	await admin.save();
	// tslint:disable-next-line: no-console
	console.log(admin.name + ' is now an admin');
});

const app: App = new App({
    port: 4000,
    middlewares: [
        bodyParser.json(),
        bodyParser.urlencoded({
            extended: true,
        }),
        cors({
            origin: [
				'lIST_OF_ORIGINS',
                'https://game-linter.com',
                'https://www.game-linter.com',
                'https://short.game-linter.com',
            ],
        }),
        morgan('dev'),
        helmet()
    ]
});

import setterController from './controllers/setter';
import User from './models/user';

app.app.get('/:id', async (req: Request, res: Response) => {
	// tslint:disable-next-line: no-console
	console.log(req.params.id);
	try {
		const exist: any = await Url.findOne({
			hash: req.params.id,
		});
		if (exist) {
			await Url.updateOne(
				{
					hash: req.params.id,
				},
				{
					$inc: {
						visits: 1,
					},
				}
			);
			return res.redirect(exist.orgUrl);
		} else {
			return res.status(400).send('The link may have changed or was deleted');
		}
	} catch (error) {
		res.status(500).json({
			message: 'Server error',
		});
	}
});

app.app.use('/api', setterController);

// REACT APP and home redirect
app.app.get('/app/client*', (req: Request, res: Response) => {
	// tslint:disable-next-line: no-shadowed-variable
	app.app.use(
		express.static(path.join(__dirname, 'client/build'), {
			// tslint:disable-next-line: no-shadowed-variable
			setHeaders: (res: Response, _path: string) => {
				res.set('Cache-Control', 'no-cache');
			},
		})
	);
	app.app.use(
		express.static(path.join(__dirname, 'client/build/static'), {
			maxAge: 31536000,
		})
	);
	res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.app.get('/', (req: Request, res: Response) => {
	res.redirect('/app/client');
});

app.listen();
