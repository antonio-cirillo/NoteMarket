module.exports = {
    
    CATALOG: [
        {
            title: 'Programmazione distribuita',
            description: 'Appunti del corso di programmazione distribuita, anno accademico 2019/2020.',
            price: 1.99,
            image: 'https://www.federica.eu/wp-content/uploads/2020/07/Banner-BLOG-informatica-Facebook-1080x628.png',
            file: 'https://www.axitech.it/sites/default/files/attachment/esempio_PDF.pdf',
            emailVendor: 'verificato@email.it',
            emailModerator: 'dev.cirillo@gmail.com',
            status: 'notVerified',
            comments: [],
            sentiments: { 
                count: 0, 
                analysis: {
                    positive: { 
                        percent: 0,
                        count: 0
                    },
                    negative: {
                        percent: 0,
                        count: 0
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        },
        {
            title: 'Sicurezza dei Dati',
            description: 'Appunti del corso di sicurezza dei dati, anno accademico 2020/2021.',
            price: 3.99,
            image: 'https://www.africarivista.it/wp-content/uploads/2021/01/I-migliori-corsi-di-sicurezza-informatica-per-diventare-un-esperto.jpg',
            file: 'https://www.axitech.it/sites/default/files/attachment/esempio_PDF.pdf',
            emailVendor: 'verificato@email.it',
            emailModerator: '',
            status: 'verified',
            comments: [
                {
                    email: 'commento@email.it',
                    comment: 'Appunti fatti molto bene, complimenti.'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Grazie a te sono riuscito a passare l\'esame, ti ringrazio!'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Ottima struttura degli appunti, fogli puliti, pochi colori e molto dettagliati, grazie mille!'
                }
            ],
            sentiments: { 
                count: 3, 
                analysis: {
                    positive: { 
                        percent: 100,
                        count: 3
                    },
                    negative: {
                        percent: 0,
                        count: 0
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        },
        {
            title: 'Cloud Computing',
            description: 'Appunti del corso di cloud computing, anno accademico 2020/2021.',
            price: 1.99,
            image: 'https://www.alet.com/wp-content/uploads/2021/08/svantaggi-cloud-computing.jpg',
            file: 'https://www.axitech.it/sites/default/files/attachment/esempio_PDF.pdf',
            emailVendor: 'verificato@email.it',
            emailModerator: '',
            status: 'verified',
            comments: [],
            sentiments: { 
                count: 0, 
                analysis: {
                    positive: { 
                        percent: 0,
                        count: 0
                    },
                    negative: {
                        percent: 0,
                        count: 0
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        },
        {
            title: 'Reti Geografiche',
            description: 'Appunti del corso di reti geografiche, anno accademico 2020/2021.',
            price: 0.99,
            image: 'https://www.stampaetnea.it/wp-content/uploads/2020/01/rete.png',
            file: 'https://www.axitech.it/sites/default/files/attachment/esempio_PDF.pdf',
            emailVendor: 'verificato@email.it',
            emailModerator: '',
            status: 'verified',
            comments: [
                {
                    email: 'commento@email.it',
                    comment: 'Appunti orrendi, davvero pessimi, soldi buttati.'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Grazie a te sono riuscito a passare l\'esame, ti ringrazio!'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Sconsiglio vivamente di acquistare questi appunti, davvero fatti male!'
                }
            ],
            sentiments: { 
                count: 3, 
                analysis: {
                    positive: { 
                        percent: 33,
                        count: 1
                    },
                    negative: {
                        percent: 67,
                        count: 2
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        },
        {
            title: 'Compilatori',
            description: 'Appunti del corso di compilatori, anno accademico 20120/2021.',
            price: 4.99,
            image: 'https://it.emcelettronica.com/wp-content/uploads/2018/10/c-linguaggio-680x340.jpg',
            file: 'https://www.axitech.it/sites/default/files/attachment/esempio_PDF.pdf',
            emailVendor: 'verificato@email.it',
            emailModerator: '',
            status: 'verified',
            comments: [
                {
                    email: 'commento@email.it',
                    comment: 'Appunti fatti molto bene, complimenti.'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Grazie a te sono riuscito a passare l\'esame, ti ringrazio!'
                },
                {
                    email: 'commento@email.it',
                    comment: 'Ottima struttura degli appunti, fogli puliti, pochi colori e molto dettagliati, grazie mille!'
                }
            ],
            sentiments: { 
                count: 3, 
                analysis: {
                    positive: { 
                        percent: 100,
                        count: 3
                    },
                    negative: {
                        percent: 0,
                        count: 0
                    },
                    neutral: {
                        percent: 0,
                        count: 0
                    },
                }
            }
        }
    ],

    USERS: [
        {
            email: 'verificato@email.it',
            password: '$2a$12$l4fT7W.O.RbKPzVd7l0fbO7KOzZdJoL5ST84ArOWOMzHoKF2eF4JK', // Verificato123
            name: 'Account',
            surname: 'Verificato',
            dob: new Date(1999, 1, 1),
            itemsBuyed: [],
            itemsSelling: []
        },
        {
            email: 'moderatore1@email.it',
            password: '$2a$12$bPiMEnJ/KA2eXnnViSOfwOxR9eZXvTMFNK3JadTkRF2FnGKLKzbES', // Moderatore1
            name: 'Primo',
            surname: 'Moderatore',
            dob: new Date(1999, 1, 1),
            itemsBuyed: [],
            itemsSelling: [],
            moderator: true
        },
        {
            email: 'moderatore2@email.it',
            password: '$2a$12$4JjCmsPT61S68jIb35WvlegmXnEnc8HfYuJQta0xNK7xxw8jYFvvm', // Moderatore2
            name: 'Secondo',
            surname: 'Moderatore',
            dob: new Date(1999, 1, 1),
            itemsBuyed: [],
            itemsSelling: [],
            moderator: true,
            itemsAssigned: 3
        }
    ]
}