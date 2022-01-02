import Stripe from 'stripe';
import axios from 'axios';

export async function postCheckout(req, res) {

    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
        apiVersion: '2020-08-27',
    });

    // Get all items
    let items = []
    if (req.session.cart.length > 0) {
        for (const _id of req.session.cart) {
            try {
                const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
                if (response.data.error) {
                    res.status(404).send('Si è verificato un errore, perfavore contattare il supporto!');
                    return;
                }
                else {
                    items.push(response.data);
                }
            } catch (error) {
                res.status(404).send('Si è verificato un errore, perfavore contattare il supporto!');
                return;
            }
        }
    } else {
        res.status(404).send('Si è verificato un errore, perfavore contattare il supporto!');
        return;
    }

    // Create line_items array
    let line_items = items.map((product) => {
        return {
            price_data: {
                currency: 'EUR',
                product_data: {
                    name: product.title,
                    images: [product.image]
                },
                unit_amount: Math.round(product.price) * 100
            },
            quantity: 1,
        };
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        mode: 'payment',
        success_url: `${process.env.YOUR_DOMAIN}/catalogo/checkout/success`,
        cancel_url: `${process.env.YOUR_DOMAIN}/catalogo/checkout/cancel`
    });

    res.json({ id: session.id });

}

export async function getSuccess(req, res) {
    
    // Empty cart
    req.session.cart = [];
    req.session.save();

}