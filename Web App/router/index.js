import axios from 'axios';

export async function getIndex(req, res) {

    // If user is logged 
    if (req.session.user) {
        if (req.session.user.moderator) {
            try {
                const response = await axios.post(process.env.URL_FUNCTION_GET_ITEMS_TO_APPROVE, {
                    email: req.session.user.email
                });
                if (response.data.error) {
                    res.render('moderatorHome', {
                        error: 'Errore durante la comunicazione col database! Riprovare.',
                        confirm: '',
                        user: req.session.user,
                        items: []
                    });
                } else {
                    res.render('moderatorHome', {
                        error: (req.query.error) ? req.query.error : '',
                        confirm: (req.query.confirm) ? req.query.confirm : '',
                        user: req.session.user,
                        items: response.data
                    });
                }
            } catch (error) {
                res.render('moderatorHome', {
                    error: 'Errore durante la comunicazione col database! Riprovare.',
                    confirm: '',
                    user: req.session.user,
                    items: []
                });
                return;
            }
        } else {
            // Declare list of item owned
            let items = [];
            const user = req.session.user;
            try {
                for (const _id of user.itemsBuyed) {
                    const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
                    if (response.data.error) {
                        res.render('userHome', {
                            error: 'Errore durante la comunicazione col database! Riprovare.',
                            confirm: '',
                            user: req.session.user,
                            items: []
                        });
                        return;
                    } else {
                        items.push(response.data);
                    }
                }
                res.render('userHome', {
                    error: (req.query.error) ? req.query.error : '',
                    confirm: (req.query.confirm) ? req.query.confirm : '',
                    user: req.session.user,
                    items: items
                })
            } catch (error) {
                res.render('userHome', {
                    error: 'Errore durante la comunicazione col database! Riprovare.',
                    confirm: '',
                    user: req.session.user,
                    items: []
                })
            }
        }
    } 
    // If user is not logged
    else {
        res.render('index');
    }

}