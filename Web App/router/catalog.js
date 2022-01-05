import axios from 'axios';
import fs from 'fs';
import https from 'https';
import mime from 'mime-types';
import dotenv from 'dotenv';
dotenv.config();

// Set __dirname in ES6
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import{ BlobServiceClient } from '@azure/storage-blob';
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.STORAGE_STRING_CONNECTION);

const COMMENT_REGEX = /[a-zA-Z0-9@=\-'"]{3,256}/;
const TITLE_REGEX = /[a-zA-Z0-9@=\-'"]{3,50}/
const PRICE_REGEX = /(0|([1-9][0-9]*))(\.[0-9]+)?/
const DESCRIPTION_REGEX = /[a-zA-Z0-9@=\-'"]{3,512}/

export function getCatalog(req, res) {
    
    // Declare object for ejs
    let object = {};

    // Check if there is an error
    if (req.query.error) {
        if (req.query.error == "notFound") {
            object.error = "Il prodotto che stai cercando non esiste!";
        } else {
            object.error = "Ops! Qualcosa è andato storto";
        }
    } else {
        object.error = '';
    }

    // If user is logged 
    if (req.session.user) {
        object.logged = true;
    } 
    // If user is not logged
    else {
        object.logged = false;
    }

    // Export catalog
    if (req.query.title != null) {
        // Call serverless with filter
        axios.post(process.env.URL_FUNCTION_GET_CATALOG, {
            title: req.query.title
        }).then((response) => {
            // Check if there is an error
            if (response.data.error) {
                object.error = 'Ops! Qualcosa è andato storto.';
                object.catalog = [];
            } 
            // Retrive catalog successful
            else {
                object.catalog = response.data;
            }
            // Render page with all parameter
            res.render('catalog', object);
        }, (error) => {
            object.error = 'Ops! Qualcosa è andato storto.';
            object.catalog = [];
            // Render page with all parameter
            res.render('catalog', object);
        });
    } else {
        // Call serverless without filter
        axios.post(process.env.URL_FUNCTION_GET_CATALOG, {}).then((response) => {
            // Check if there is an error
            if (response.data.error) {
                object.error = 'Ops! Qualcosa è andato storto.';
                object.catalog = [];
            } 
            // Retrive catalog successful
            else {
                object.catalog = response.data;
            }
            // Render page with all parameter
            res.render('catalog', object);
        }, (error) => {
            object.error = 'Ops! Qualcosa è andato storto.';
            object.catalog = [];
            // Render page with all parameter
            res.render('catalog', object);
        });
    }

}

export async function getItem(req, res) {

    // Declare object for ejs
    let object = {};
    // Get id of item
    const _id = req.params._id;

    // Check if user logged is moderator
    if (req.session.user && req.session.user.moderator) {
        object.isModerator = true;
    } else {
        object.isModerator = false;
    }
    
    // Call serverless for get item
    try {

        const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
        // Check if there is an error
        if (response.data.error || response.data.status == "notVerified") {
            res.redirect('../catalogo?error=notFound');
            return;
        } 
        // Retrive item successful
        else {
            object.item = response.data;
        }

    } catch (error) {
        res.redirect('../catalogo?error=notFound');
        return;
    }  

    // Init isOwned parameter
    object.isOwned = false;
    object.isVendor = false;

    // If user is logged 
    if (req.session.user) {
        object.logged = true;
        if (object.item.emailVendor == req.session.user.email) {
            object.isVendor = true;
        }
        if (req.session.user.itemsBuyed.includes(_id) || object.isVendor) {
            object.isOwned = true;
        }
        if (req.session.cart.includes(_id)) {
            object.insideCart = true;
        } else {
            object.insideCart = false;
        }
    } 
    // If user is not logged
    else {
        object.logged = false;
        object.insideCart = false;
    }

    res.render('item', object);

}

export async function postComment(req, res) {
    
    // Get id of item
    const _id = req.params._id;
    const comment = req.body.comment;
    const email = req.session.user.email;

    // If user can't post comment because he doesn't own item
    if (!(req.session.user.itemsBuyed.includes(_id))) {
        res.status(404).json({ error: true });
        return;
    }

    // Test if comment match with pattern
    if (!COMMENT_REGEX.test(comment)) {
        res.status(404).json({ error: true });
        return;
    }

    try {

        // Call serverless for post comment
        const response = await axios.post(process.env.URL_FUNCTION_POST_COMMENT, {
            _id: _id,
            email: email,
            comment: comment
        });

        // Check if there is an error
        if (response.data.error) {
            res.status(404).json({ error: true });
            return;
        } 

        // Retrive email
        response.data.email = req.session.user.email;

        // Send new sentiment analysis data
        res.status(200).json(response.data);
        return;

    } catch (error) {
        res.status(404).json({ error: true });
        return;
    }

}

export async function postItem(req, res) {
    
    const { title, price, description } = req.body;

    if (!TITLE_REGEX.test(title) || !DESCRIPTION_REGEX.test(description) ||
            price.match(PRICE_REGEX)[0] != price) {
        res.redirect('../../?error=Ops!%20Qualcosa%20è%20andato%20storto.');
        return;
    }

    // Check on image
    const image = req.files.image[0];
    const IMAGES_MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

    if (IMAGES_MIME_TYPES.indexOf(image.mimetype) == -1) {
        res.redirect('../../?error=Immagine%20non%20supportata!');
        return;
    }
    if (image.size > 2000000) { // 2 MB
        res.redirect('../../?error=L\'%20immagine%20non%20deve%20superare%20i%202%20mb!');
        return;
    }
    const imageData = fs.createReadStream(image.path);

    // Check on pdf
    const item = req.files.item[0];
    if (item.mimetype != 'application/pdf') {
        res.redirect('../../?error=File%20non%20supportato!');
        return;
    }
    if (item.size > 20000000) { // 20 MB
        res.redirect('../../?error=Il%20file%20non%20deve%20superare%20i%2020%20mb!');
        return;
    }
    const itemData = fs.createReadStream(item.path);

    // Call serverless for upload item
    try {

        const NAME_CONTAINER = process.env.STORAGE_CONTAINER;

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(process.env.STORAGE_CONTAINER);
        await containerClient.createIfNotExists();

        // Upload image
        let blockBlobClient = containerClient.getBlockBlobClient(
            `${image.filename}.${mime.extension(image.mimetype)}`);
        await blockBlobClient.uploadStream(imageData, 4 * 1024 * 1024, 20);

        // Upload item
        blockBlobClient = containerClient.getBlockBlobClient(`${item.filename}.pdf`);
        await blockBlobClient.uploadStream(itemData, 4 * 1024 * 1024, 20);
        
        const response = await axios.post(process.env.URL_FUNCTION_UPLOAD_ITEM, {
            title: title,
            description: description,
            price: price,
            image: `${process.env.STORAGE_URL}/${NAME_CONTAINER}/${image.filename}.${mime.extension(image.mimetype)}`,
            file: `${process.env.STORAGE_URL}/${NAME_CONTAINER}/${item.filename}.pdf`,
            emailVendor: req.session.user.email
        });

        // Check if there is an error
        if (response.data.error) {
            res.redirect('../../?error=Ops!%20Qualcosa%20è%20andato%20storto.');
            return;
        }
        // Post item successful
        else {
            res.redirect('../../?confirm=L\'appunto%20è%20stato%20caricato!%20Un%20moderatore%20revisionerà%20l\'appunto%20il%20prima%20possibile.');
            return;
        }

    } catch (error) {
        res.redirect('../../?error=Ops!%20Qualcosa%20è%20andato%20storto.');
        return;
    }

}

export function getDownload(req, res) {
 
    // Get id of item
    const _id = req.params._id;

    try {

        axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id })
        .then((response) => {
            // Check if there is an error
            if (response.data.error) {
                res.redirect('../catalogo?error=notFound');
                return;
            }

            // Check if user have permission for download item
            let isVendor = false;
            if (response.data.emailVendor == req.session.user.email) {
                isVendor = true;
            }
            if (!req.session.user.moderator) {
                if (!req.session.user.itemsBuyed.includes(_id) && !isVendor) {
                        res.status(404).json({ error: true });
                        return;
                }
            }

            // Download from storage account and send it
            const path = `${__dirname}/../uploads/${response.data.title}.pdf`;
            const title =  response.data.title

            let file = fs.createWriteStream(path);

            https.get(`${response.data.file}`, (response) => {
                response.pipe(file)
                .on('finish', () => {
                    file = fs.createReadStream(path);
                    const stat = fs.statSync(path);
                    res.setHeader('Content-Length', stat.size);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename=${title}.pdf`);
                    file.pipe(res);
                });
            });
                    
        }, (error) => {
            res.status(404).json({ error: true });
            return;
        });

    } catch (error) {
        res.status(404).json({ error: true });
        return;
    }
  
}

export async function getReview(req, res) {
 
    // Get id of item
    const _id = req.params._id;

    try {

        const response = await axios.post(process.env.URL_FUNCTION_REVIEW_ITEM, { 
            _id: _id,
            flag: (req.query.action == 'approva') ? true : false
        });
        
        // Check if there is an error
        if (response.data.error) {
            res.redirect('../../?error=Ops!%20Qualcosa%20è%20andato%20storto.');
            return;
        }

        res.redirect(`../../?confirm=L'%20appunto%20è%20stato%20${(req.query.action == 'approva') ? 'approvato ': 'respinto'}.`);
        return;

    } catch (error) {
        res.redirect('../../?error=Ops!%20Qualcosa%20è%20andato%20storto.');
        return;
    }
  
}