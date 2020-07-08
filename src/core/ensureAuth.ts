import {Request, Response, NextFunction}  from 'express'

const ensureAth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next()
    }
    else {
        req.session.FORWAD = req.originalUrl;
        return res.json(false)
    }
}

export default ensureAth