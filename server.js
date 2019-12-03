/* 
Import
*/
    // NodeJS
    require('dotenv').config();
    const express = require('express');
    const bodyParser = require('body-parser');
    const path = require('path');
    const ejs = require('ejs');
    const fetch = require('node-fetch');
    const cors = require('cors')
//


/* 
Config
*/
    // Declarations
    const server = express();
    const apiRouter = express.Router({ mergeParams: true });
    const frontRouter = express.Router({ mergeParams: true });
    const Models = require('./models/index');
    const port = process.env.PORT    

    // Server class
    class ServerClass{
        init(){
            // Set CORS
            server.use(cors());

            // View engine configuration
            server.engine( 'html', ejs.renderFile );
            server.set('view engine', 'html');

            // Static path configuration
            server.set( 'views', __dirname + '/www' );
            server.use( express.static(path.join(__dirname, 'www')) );

            //=> Body-parser
            server.use(bodyParser.json({limit: '10mb'}));
            server.use(bodyParser.urlencoded({ extended: true }));


            //=> Set routers
            server.use('/api', apiRouter);
            server.use('/', frontRouter);

            // Start server
            this.launch();
        };

        frontRoutes(){
            /**
             * Route to display front page
             * @param path: String => any endpoints
            */
            frontRouter.get( '/', (req, res) => res.render('index') );
            frontRouter.get( '/register', (req, res) => res.render('register') );

        };

        apiRoutes(){
            /**
             * Route to create new item
             * @param path: String => api endpoint
             * @param body: Object => mandatory data
            */
            apiRouter.post('/:endpoint/', (req, res) => {
                console.log(req.body)
                console.log(req.params['endpoint'])
                // Envoyer les données de la requête dans le fetch
                fetch(`http://localhost:3000/${req.params['endpoint']}/`, {
                    method: 'POST',
                    body: JSON.stringify(req.body),
                    headers: { 'Content-Type': 'application/json' },
                })
                .then( response => {
                    // Extraire les données
                    return response.json();
                })
                .then( data => {
                    res.json(data)
                })
                .catch( err => {
                    res.json(err)
                })
            });
    
            /**
             * Route to get item data by _id
             * @param path: String => api endpoint
             * @param id: String => selected objet id
            */
            apiRouter.get('/:endpoint/:id', (req, res) => {
                // Récupérer le endpoint
                const endpoint = req.params['endpoint'];
                
                // Récupérer les données depuis la BDD
                fetch(`http://localhost:3000/${endpoint}/${req.params['id']}`)
                .then( response => {
                    // Extraire les données
                    return response.json();
                })
                .then( data => {
                    res.json(data)
                })
                .catch( err => {
                    res.json(err)
                })
            });
    
            /**
             * Route to get all item data
             * @param path: String => api endpoint
            */
            apiRouter.get('/:endpoint/', (req, res) => {
                // Récupérer le endpoint
                const endpoint = req.params['endpoint'];
                
                // Récupérer les données depuis la BDD
                fetch(`http://localhost:3000/${endpoint}/`)
                .then( response => {
                    // Extraire les données
                    return response.json();
                })
                .then( data => {
                    res.json(data)
                })
                .catch( err => {
                    res.json(err)
                })
            });
    
            /**
             * Route to update item data by _id
             * @param path: String => api endpoint
             * @param id: String => selected objet id
            */
            apiRouter.put('/:endpoint/:id', (req, res) => {
                // Check request body
                if (
                    req.body.email === undefined &&
                    req.body.username === undefined &&
                    req.body.password === undefined
    
                ) { return res.status(400).json({ message: 'No data provided', data: null }) }
               
                else{
                    Models[ req.params['endpoint'] ].findByIdAndUpdate(req.params.id, {$set: req.body}, (error, item) => {
                        if(error) { return res.status(400).json({ message: 'Network error', data: null}) }
                        else if(item) { return res.status(200).send({ message: 'Object updated', data: req.params.id }) }
                    });
                }
            });
    
            /**
             * Route to delete item by _id
             * @param path: String => api endpoint
             * @param id: String => selected objet id
            */
            apiRouter.delete('/:endpoint/:id', (req, res) => {
                Models[ req.params['endpoint'] ].findByIdAndDelete({_id: req.params.id}, (error, item) => {
                    if(error) { return res.status(400).json({ message: 'Network error', data: null}) }
                    else if(item) { return res.status(200).send({ message: 'Object deleted', data: req.params.id }) }
                });
            });
        };

        launch(){
            // Init Routers
            this.frontRoutes();
            this.apiRoutes();

            server.listen(port, () => console.log({ server: `http://localhost:${port}` }))
        };
    };
//


/* 
Start
*/
    new ServerClass().init();
//