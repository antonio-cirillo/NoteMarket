import axios from 'axios';

const COMMENT_REGEX = /[a-zA-Z0-9@=\-'"]{3,256}/;

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

    // If user is logged 
    if (req.session.user) {
        object.logged = true;
        if (req.session.user.itemsBuyed.includes(_id) ||
                req.session.user.itemsSelling.includes(_id)) {
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