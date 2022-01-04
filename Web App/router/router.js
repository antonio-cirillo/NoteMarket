import express from 'express';
import multer from 'multer';

// Import routers
import { getIndex } from './index.js';
import { getLogin, postLogin } from './login.js';
import { allLogout } from './logout.js';
import { getRegistration, postRegistration } from './registration.js';
import { getCatalog, getDownload, getItem, postComment, postItem } from './catalog.js';
import { getCart, getAddToCart, getRemoveToCart } from './cart.js';
import { getSuccess, getCancel, postCheckout } from './checkout.js';

// Import interceptors
import isUserLogged from '../interceptors/isUserLogged.js';
import isNotUserLogged from '../interceptors/isNotUserLogged.js';

// Create Router
const router = express.Router();

// Declare object for upload file from form
const upload = multer({ dest: 'uploads/' });
const uploadFile = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'item', maxCount: 1 }]);

//===================== HOME PAGE =====================//
router.get('/', getIndex);

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
router.post('/catalogo/aggiungi-appunto', isNotUserLogged, uploadFile, postItem);

//=================== ADD TO CART PAGE ===================//
router.post('/catalogo/aggiungi-al-carrello', isNotUserLogged, getAddToCart);

//================== REMOVE TO CART PAGE =================//
router.post('/catalogo/rimuovi-dal-carrello', isNotUserLogged, getRemoveToCart);

//======================= ITEM PAGE =======================//
router.get('/catalogo/:_id', getItem);

router.post('/catalogo/:_id/scrivi-commento', isNotUserLogged, postComment);

router.get('/catalogo/:_id/scarica-appunto', isNotUserLogged, getDownload);

//======================= CART PAGE =======================//
router.get('/carrello', isNotUserLogged, getCart);

//===================== CHECKOUT PAGE =====================//
router.post('/catalogo/checkout', isNotUserLogged, postCheckout);

router.get('/catalogo/checkout/success', isNotUserLogged, getSuccess);

router.get('/catalogo/checkout/cancel', isNotUserLogged, getCancel);

// Export router
export default router;