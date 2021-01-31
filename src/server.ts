import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, INVALID_IMAGE_URL} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url.
  app.get( "/filteredimage", async ( req: express.Request, res: express.Response ) => {
    if (!req.query.image_url) {
      return res.status(400).send("you must include an image_url in your request");
    }
    const {image_url} = req.query;
    if (!/^http(s?):/.exec(image_url)) {
      return res.status(400).send("only http and https are supported");
    }
    try {
      const imageFile = await filterImageFromURL( req.query.image_url );
      res.sendFile( imageFile, () => {
        if ( imageFile ) {
          deleteLocalFiles( [imageFile] );
        }
      });
    } catch (error) {
      if (error === INVALID_IMAGE_URL) {
        res.status(400).send(`Could not read image from URL ${req.query.image_url}`);
      }
      else {
        console.error(`Could not convert image for URL ${req.query.image_url}`, error);
        res.sendStatus(500);
      }
    }
  })

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: express.Request, res: express.Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();