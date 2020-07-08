import mongoose from 'mongoose';
import Url from '../models/url';
import User from '../models/user';
import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import lodash from 'lodash';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import connectMongo, { MongoStoreFactory } from 'connect-mongo';
import validator from 'validator';

// Classes
import App from '../core/server';
import Passport from '../core/passport';

const MongoStore: MongoStoreFactory = connectMongo(session);

const passport: Passport = new Passport({
	middlewares: [
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'pwd',
			},
			(username, password, done) => {
				// console.log(username, password)
				User.findOne({ email: username }, (err: any, user: any): void => {
					if (err) {
						return done(err);
					}
					if (!user) {
						return done(null, false, { message: 'Incorrect username.' });
					}
					// console.log(password, user.pwd)
					// tslint:disable-next-line: no-shadowed-variable
					bcrypt.compare(password, user.pwd, (err: Error, same: boolean) => {
						if (err) {
							return err;
						}
						if (same) {
							return done(null, user);
						}
						return done(null, false, { message: 'Incorrect password.' });
					});
				});
			}
        ),
    ],
    serial: (user: any, done) => {
        done(null, user.id);
    },
    deserial: (id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    }
});

const app: App = new App({
	middlewares: [
		session({
			secret: 'fuckaguysecret',
			store: new MongoStore({
				mongooseConnection: mongoose.connection,
				autoReconnect: true,
				autoRemove: 'native',
			}),
			resave: true,
			saveUninitialized: false,
			cookie: {
				sameSite: true,
				secure: 'auto',
				maxAge: 1209600000,
				httpOnly: true,
			},
		}),
		passport.methods.initialize(),
		passport.methods.session(),
	],
});

import ensureAth from '../core/ensureAuth';

app.app.get('/user', ensureAth, async (req: Request, res: Response) => {
	const { _id, role }: any = req.user;

	if (!role) {
		await User.findOne({
			_id,
		})
			.populate('urls')
			.then((r) => {
				// console.log(r)
				res.json({
					role: 'user',
					data: r,
				});
			});
	} else if (role === 'admin') {
		await Url.find({}).then((allDocs) => {
			res.json({
				role,
				data: allDocs,
			});
		});
		return;
	} else {
		res.sendStatus(401);
	}
});
app.app.post('/shorten', async (req: Request, res: Response) => {
	if (!validator.isURL(req.body.longUri)) {
		return res.status(301).json({
			success: false,
			message: 'Not a valid url',
		});
	}
	try {
		const exist = await Url.findOne({
			orgUrl: req.body.longUri,
		});
		if (exist) {
			if (req.isAuthenticated()) {
				const user: any = req.user;
				if (!user.urls.includes(exist._id)) {
					user.urls.push(exist._id);
					await user.save();
				}
			}
			return res.json(exist);
		}
		let lol;
		let lolExist;
		do {
			lol = crypto.randomBytes(3).toString('hex');
			lolExist = await Url.findOne({
				hash: lol,
			});
			if (!lolExist) {
				const newUrl = new Url({
					hash: lol,
					orgUrl: req.body.longUri,
					shortenedUrl: 'https://short.game-linter.com/' + lol,
					visits: 0,
				});
				if (req.isAuthenticated()) {
					const user: any = req.user;
					await user.urls.push(newUrl._id);
					await user.save();
				}
				await newUrl.save();
				return res.status(200).json(newUrl);
			}
		} while (lolExist);
	} catch (error) {
		return res.status(500).json('server error');
	}
});
app.app.get('/logout', (req, res) => {
	req.logout();
	res.json(true);
});
app.app.post('/create', async (req, res) => {
	const { email, pwd, pwd2, name } = req.body;

	try {
		const user = await User.findOne({
			email,
		});
		if (user) {
			return res.status(202).json({
				message: 'user exists',
			});
		}
		if (pwd !== pwd2) {
			return res.status(202).json({
				message: 'passwords do not match',
			});
		}
		bcrypt.hash(pwd, 10, async (err, hash) => {
			if (err) {
				return res.status(501).json(err);
			}
			const today = new Date();
			const newUser = new User({
				email,
				pwd: hash,
				joinedDate: today.getUTCDate(),
				name: lodash.toUpper(name),
			});
			await newUser.save();
			res.status(200).json(newUser);
		});
	} catch (error) {
		res.status(501).json(error);
	}
});

app.app.get('/logged', (req: Request, res: Response) => {
	res.json(req.isAuthenticated());
});

app.app.post(
	'/login',
	passport.methods.authenticate('local'),
	(req: Request, res: Response) => {
		res.status(200).json(req.user);
	}
);

export default app.app;
