import express from 'express';
import multer from 'multer';

// Import routers
import { getIndex, postUpdateTelegramToken } from './index.js';
import { getLogin, postLogin } from './login.js';
import { allLogout } from './logout.js';
import { getRegistration, postRegistration } from './registration.js';
import { getCatalog, getDownload, getItem, postComment, postItem, getReview } from './catalog.js';
import { getCart, getAddToCart, getRemoveToCart } from './cart.js';
import { getSuccess, getCancel, postCheckout } from './checkout.js';

// Import interceptors
import isUserLogged from '../interceptors/isUserLogged.js';
import isNotUserLogged from '../interceptors/isNotUserLogged.js';
import isModeratorLogged from '../interceptors/isModeratorLogged.js';
import isNotModeratorLogged from '../interceptors/isNotModeratorLogged.js';

// Create Router
const router = express.Router();

// Declare object for upload file from form
const upload = multer({ dest: 'uploads/' });
const uploadFile = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'item', maxCount: 1 }]);

//===================== HOME PAGE =====================//
router.get('/', getIndex);

router.post('/aggiorna-telegram-token', isNotUserLogged, postUpdateTelegramToken);

//===================== LOGIN PAGE =====================//
router.get('/login', isUserLogged, getLogin);

router.post('/login', isUserLogged, postLogin);

//===================== LOGOUT PAGE =====================//
router.all('/logout', isNotUserLogged, allLogout);

//================== REGISTRATION PAGE ==================//
router.get('/registrati', isUserLogged, getRegistration);

router.post('/registrati', isUserLogged, postRegistration);

//===================== CATALOG PAGE =====================//
router.get('/catalogo', getCatalog);

//===================== ADD ITEM PAGE ====================//
router.post('/catalogo/aggiungi-appunto', isNotUserLogged, isModeratorLogged, uploadFile, postItem);

//=================== ADD TO CART PAGE ===================//
router.post('/catalogo/aggiungi-al-carrello', isNotUserLogged, isModeratorLogged, getAddToCart);

//================== REMOVE TO CART PAGE =================//
router.post('/catalogo/rimuovi-dal-carrello', isNotUserLogged, isModeratorLogged, getRemoveToCart);

//======================= ITEM PAGE =======================//
router.get('/catalogo/:_id', getItem);

router.get('/catalogo/:_id/revisiona-appunto', isNotUserLogged, isNotModeratorLogged, getReview);

router.post('/catalogo/:_id/scrivi-commento', isNotUserLogged, isModeratorLogged, postComment);

router.get('/catalogo/:_id/scarica-appunto', isNotUserLogged, getDownload);

//======================= CART PAGE =======================//
router.get('/carrello', isNotUserLogged, isModeratorLogged, getCart);

//===================== CHECKOUT PAGE =====================//
router.post('/catalogo/checkout', isNotUserLogged, isModeratorLogged, postCheckout);

router.get('/catalogo/checkout/success', isNotUserLogged, isModeratorLogged, getSuccess);

router.get('/catalogo/checkout/cancel', isNotUserLogged, isModeratorLogged, getCancel);

// Export router
export default router;