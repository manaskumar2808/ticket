import express from 'express';

import { currentUser } from '@ms28tickets/commonlib/build ';

const Router = express.Router();

Router.get('/api/users/currentuser', currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { Router as currentUserRouter };