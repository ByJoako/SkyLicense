const express = require('express');
const router = express.Router();
const passport = require('../middlewares/auth');
const authenticateToken = require('../middlewares/authenticator');
const { getCallback } = require('../controllers/authController');
const apiController = require('../controllers/restAPIController');
const blacklistController = require('../controllers/blacklistController');
const loggerController = require('../controllers/loggerController');
const userController = require('../controllers/userController');
const { getLicenses,
  clearIp,
  clearHWID,
  resetKey, } = require('../controllers/licensesController');
const { getProducts, download } = require('../controllers/productsController');
const productController = require('../controllers/adminProductController');

router.get('/auth/discord', passport.authenticate('discord'));

// Ruta de callback después de la autenticación con Discord
router.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }), getCallback
);



router.get('/licenses', authenticateToken, getLicenses);
router.post('/licenses/:license_key/clearIp', authenticateToken, clearIp);
router.post('/licenses/:license_key/clearHwid', authenticateToken, clearHWID);
router.post('/licenses/:license_key/resetKey', authenticateToken, resetKey);

router.get('/products', authenticateToken, getProducts);
router.post('/products/:name/:version/download', authenticateToken, download);
router.get('/blacklist/list', authenticateToken, blacklistController.getList);
router.post('/blacklist/add', authenticateToken, blacklistController.add);
router.post('/blacklist/remove', authenticateToken, blacklistController.remove);
router.get('/logger', authenticateToken, loggerController.getGeneral);
router.get('/request', authenticateToken, loggerController.getRequest);

router.get('/users', authenticateToken, userController.getUsers);
router.post('/users/:userId/role', authenticateToken, userController.updateRole);
router.post('/users/:userId/ban', authenticateToken, userController.updateBan);
router.post('/license', apiController.restAPI);
router.get('/private-key', authenticateToken, (req, res) => {
  res.json(process.env.CODE_PRIVATE)
});

router.get('/admin(products', authenticateToken, productController.getProducts);
router.post('/admin/products/create', authenticateToken, productController.create);
router.post('/admin/products/delete', authenticateToken, productController.remove);
module.exports = router;