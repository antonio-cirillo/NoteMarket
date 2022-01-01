import express from 'express';

// Import routers
import { getIndex } from './index.js';
import { getLogin, postLogin } from './login.js';
import { allLogout } from './logout.js';
import { getRegistration, postRegistration } from './registration.js';
import { getActiveAccount } from './activeAccount.js';
import { getCatalog, getItem } from './catalog.js';

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

//======================= ITEM PAGE =======================//
router.get('/catalogo/:_id', getItem);

// Export router
export default router;