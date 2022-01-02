import express from 'express';

// Import routers
import { getIndex } from './index.js';
import { getLogin, postLogin } from './login.js';
import { allLogout } from './logout.js';
import { getRegistration, postRegistration } from './registration.js';
import { getActiveAccount } from './activeAccount.js';
import { getCatalog, getItem } from './catalog.js';
import { getCart, getAddToCart, getRemoveToCart } from './cart.js';
import { getSuccess, postCheckout } from './checkout.js';

// Import interceptors
import isUserLogged from '../interceptors/isUserLogged.js';
import isNotUserLogged from '../interceptors/isNotUserLogged.js';

// Create Router
const router = express.Router();

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

//================= ACTIVE ACCOUNT PAGE =================//
router.get('/attiva-account', isUserLogged, getActiveAccount);

//===================== CATALOG PAGE =====================//
router.get('/catalogo', getCatalog);

//=================== ADD TO CART PAGE ===================//
router.post('/catalogo/aggiungi-al-carrello', isNotUserLogged, getAddToCart);

//================== REMOVE TO CART PAGE =================//
router.post('/catalogo/rimuovi-dal-carrello', isNotUserLogged, getRemoveToCart);

//======================= ITEM PAGE =======================//
router.get('/catalogo/:_id', getItem);

//======================= CART PAGE =======================//
router.get('/carrello', isNotUserLogged, getCart);

//===================== CHECKOUT PAGE =====================//
router.post('/catalogo/checkout', isNotUserLogged, postCheckout);

router.get('/catalogo/checkout/success', getSuccess);

// Export router
export default router;