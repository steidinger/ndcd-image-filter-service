import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url.
  app.get( "/filteredimage", async ( req, res ) => {
    if (!req.query.image_url) {
      res.status(400).send("you must include an image_url in your request");
    }
    const imageFile = await filterImageFromURL( req.query.image_url );
    res.sendFile( imageFile, () => {
      if ( imageFile ) {
        deleteLocalFiles( [imageFile] );
      }
    });
  })

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();