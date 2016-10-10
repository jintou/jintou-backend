'use strict';

var express = require('express');
var controller = require('./money.controller');

var router = express.Router();
import * as auth from '../../auth/auth.service';

/*
router.get('/', controller.getAccounts);
router.get('/user', auth.isAuthenticated(), controller.getUserAccounts);
router.get('/:id', controller.getAccountById);
router.post('/', controller.createAccount);
router.put('/:id', controller.updateAccount);
router.patch('/:id', controller.updateAccount);
router.delete('/:id', controller.destroyAccount);

router.get('/card', controller.getCards);
router.get('/card/user', auth.isAuthenticated(), controller.getUserCards);
router.get('/card/:id', controller.getCardById);
router.post('/card', controller.createCard);
router.put('/card/:id', controller.updateCard);
router.patch('/card/:id', controller.updateCard);
router.delete('/card/:id', controller.destroyCard);

router.get('/history', controller.getHistories);
router.get('/history/user', auth.isAuthenticated(), controller.getUserHistories);
router.get('/history/:id', controller.getHistoryById);
router.post('/history', controller.createHistory);
//router.put('/history/:id', controller.updateHistory);
//router.patch('/history/:id', controller.updateHistory);
//router.delete('/history/:id', controller.destroy);

router.get('/bank', controller.getBanks);
router.get('/bank/:id', controller.getBankById);
router.post('/bank', controller.createBank);
router.put('/bank/:id', controller.updateBank);
router.patch('/bank/:id', controller.updateBank);
router.delete('/bank/:id', controller.destroyBank);
*/

module.exports = router;
