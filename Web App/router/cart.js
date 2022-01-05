import axios from 'axios';

export async function getCart(req, res) {

    // Declare object for ejs
    let object = {};

    // Check error
    if (req.query.error) {
        object.error = req.query.error;
    } else {
        object.error = null;
    }
    // Check confirm
    if (req.query.confirm) {
        object.confirm = true;
    } else {
        object.confirm = false;
    }

    // Init items and total parameters
    object.items = [];
    object.total = 0;

    // If cart is not empty
    if (req.session.cart.length > 0) {
        for (const _id of req.session.cart) {
            try {
                const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
                if (response.data.error) {
                    res.status(404).send('Si è verificato un errore, perfavore contattare il supporto!');
                    return;
                }
                else {
                    object.items.push(response.data);
                    object.total += response.data.price;
                }
            } catch (error) {
                res.status(404).send('Si è verificato un errore, perfavore contattare il supporto!');
                return;
            }
        }
    }
    
    // Set public key
    object.public_key = process.env.STRIPE_PUBLIC_KEY;

    res.render('cart', object);

}

export async function getAddToCart(req, res) {

    // Get id
    const _id = req.body._id;

    // Call serverless for get item
    try {

        const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
        // Check if item is not verified
        if (response.data.status == "notVerified") {
            res.status(404).json({ error: true });
            return;
        }
        // Check if item is owned by user
        let isVendor = false;
        if (response.data.emailVendor == req.session.user.email) {
            isVendor = true;
        }
        if (req.session.user.itemsBuyed.includes(_id) ||
                isVendor) {
            res.status(404).json({ error: true });
            return;
        }   
        // Check if there is an error
        if (response.data.error) {
            res.status(404).json({ error: true });
            return;
        } 

    } catch (error) {
        res.status(404).json({ error: true });
        return;
    }
    
    // Check if item is or not inside cart
    const index = req.session.cart.indexOf(_id);
    // If item is not inside cart
    if (index == -1) {
        req.session.cart.push(_id);
        req.session.save();
        res.status(200).json({ error: false });
        return;
    } else {
        res.status(404).json({ error: true });
        return;
    }

}

export async function getRemoveToCart(req, res) {

    // Get id
    const _id = req.body._id;

    // Call serverless for get item
    try {

        const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
        // Check if item is not verified
        if (response.data.status == "notVerified") {
            res.status(404).json({ error: true });
            return;
        }
        // Check if there is an error
        if (response.data.error) {
            res.status(404).json({ error: true });
            return;
        } 

    } catch (error) {
        res.status(404).json({ error: true });
        return;
    }
    
    // Check if item is or not inside cart
    const index = req.session.cart.indexOf(_id);
    // If item is not inside cart
    if (index == -1) {
        res.status(404).json({ error: true });
        return;
    } else {
        req.session.cart.splice(index, 1);
        req.session.save();
        res.status(200).json({ error: false });
        return;
    }

}