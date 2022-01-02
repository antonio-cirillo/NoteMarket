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
            comments: []
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
            ]
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
            comments: []
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
            ]
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
            ]
        }
    ],

    USERS: [
        {
            email: 'verificato@email.it',
            password: '$2a$12$l4fT7W.O.RbKPzVd7l0fbO7KOzZdJoL5ST84ArOWOMzHoKF2eF4JK', // Verificato123
            name: 'Account',
            surname: 'Verificato',
            dob: new Date(1999, 1, 1),
            status: 'verified',
            activeToken: '',
            activeExpires: null,
            itemsBuyed: [],
            itemsSelling: []
        },
        {
            email: 'nonverificato@email.it',
            password: '$2a$12$xLmoaZmPZH8JNxUipOIh0O24nWcpqfybzoXvkburCEspmCPc21jha', // NonVerificato123
            name: 'Account',
            surname: 'Non Verificato',
            dob: new Date(1999, 1, 1),
            status: 'notVerified',
            activeToken: '',
            activeExpires: null,
            itemsBuyed: [],
            itemsSelling: []
        }
    ]
}