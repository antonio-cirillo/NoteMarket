import axios from 'axios';

export function getCatalog(req, res) {
    
    let object = {}

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
                object.error = true;
                object.catalog = [];
            } 
            // Retrive catalog successful
            else {
                object.error = false;
                object.catalog = response.data;
            }
            // Render page with all parameter
            res.render('catalog', object);
        }, (error) => {
            object.error = true;
            object.catalog = [];
            // Render page with all parameter
            res.render('catalog', object);
        });
    } else {
        // Call serverless without filter
        axios.post(process.env.URL_FUNCTION_GET_CATALOG, {}).then((response) => {
            // Check if there is an error
            if (response.data.error) {
                object.error = true;
                object.catalog = [];
            } 
            // Retrive catalog successful
            else {
                object.error = false;
                object.catalog = response.data;
            }
            // Render page with all parameter
            res.render('catalog', object);
        }, (error) => {
            object.error = true;
            object.catalog = [];
            // Render page with all parameter
            res.render('catalog', object);
        });
    }

}