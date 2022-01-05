import axios from 'axios';

export async function getIndex(req, res) {

    // If user is logged 
    if (req.session.user) {
        if (req.session.moderator) {
            console.log("You are moderator");
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
                        })
                        return;
                    } else {
                        items.push(response.data);
                    }
                }
                for (const _id of user.itemsSelling) {
                    const response = await axios.post(process.env.URL_FUNCTION_GET_ITEM, { _id: _id });
                    if (response.data.error) {
                        res.render('userHome', {
                            error: 'Errore durante la comunicazione col database! Riprovare.',
                            confirm: '',
                            user: req.session.user,
                            items: []
                        })
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
                console.log(error);
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