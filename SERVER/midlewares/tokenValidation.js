import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config/setting.js';
import { loginUser } from '../routes.js';

export const confirmAuthen = (req, res, next)=>{
    const {token} = req.cookies;
    if(!token) return res.status(401).json({message: 'no token, auterization denied'});

    jwt.verify(token, TOKEN_SECRET, (err)=>{
         if(err) return res.status(403).json({message: 'Invalid token'})
        next();
    });
}