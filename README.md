# KvilleNation


### App Structure
* `server` - this directory contains your express app. This is your backend (models, controllers).
* `client` - this directory contains the react app. This is your Frontend(views).
* `docker-compose.yml` - defines the docker ecosystem needed to run the app. 
  

### Local Development
1. Installation
  * Clone project from GitHub: https://github.com/tentingkville/kvilleNation
  * Install Docker: https://docs.docker.com/get-docker/
  * Install MongoDBCompass: https://www.mongodb.com/try/download/compass
  * If you're using Mac, install docker-sync: https://docker-sync.readthedocs.io/en/latest/getting-started/installation.html
  
2. Set up the Environment (more to come on this)
  * Set up environment variables
    * Run in terminal: `cd ~`
    * `echo $SHELL`
    * If returns /bin/bash, open .bash_profile in a text editor. If zsh, open .zsh file.
    * Get the keys from the shared doc
    * For each key, add to the end of the file:
        export VARIABLE_NAME={key}
    * Close and quit all terminal windows
    * Check if variable exist: `env | grep VARIABLE_NAME`

  * Build docker image and start application
    * `cd path/to/kvilleNation`
    * `docker-compose build` - builds the images (will take a while)
    * `docker-compose up` - command to start the application

  * Initialize Database
    * `docker-compose exec mongo bash` - get a shell on the db
    * `mongosh --username root --password password` - login to db
    * `use development` - switch to dev db
    *  run the following code:
      ```javascript
      db.createUser(
      {
      user: "root",
      pwd: "password",
      roles: [
            { role: "dbOwner", db: "development" },
            { role: "readWrite", db: "development" }
      ]
      }
      );
      ```
    * Open MongoDB Compass app
      * On opening the app, should bring you to New Connection page.
      * Click "Advanced Connection Options"
      * Toggle "Authentication" to "Username/Password"
      * Enter: username = root, password = password, database = development
    * Add a new user document
      * Click "development"
      * If empty, create collection "users". If collections exist, click "users"
      * Click "Add Data" --> "Insert Document"
      * Add yourself as an admin user in JSON format (example: {"name": "Your Name", "netid": "abc123", "role": "admin"})
    * To use seed document(optional)
      * This will **wipe the current local database**, so don't do this on dev or prod!!!
      * in the terminal, type `docker-compose exec express bash`
      * once in the bash shell, type `node seed_db.js`
      * It will ask for your name, netid and number of fake employees
      * This seed file will generate some schedules and shifts for you
    
  * Restart Docker 
    * Close out of Compass
    * ^C terminal
    * `docker-compose stop` -stop docker containers
    * `docker-compose up` -start docker containers again

  * Go to localhost:3000 in your browser

3. docker-compose commands
  * `docker-compose build` - builds the images. This must be run if we install more npm packages
  * `docker-compose up` - starts the containers (react, express, mongo)
  * `docker-compose down` - tears down  the containers, run this when done
  * `docker-sync start` - start docker-sync if it's not
  * `docker-sync stop` - stop docker-sync
  * `docker-compose exec <servicename> bash` - give you a bash shell in your selected container replace *servicename* with service, e.g. react, express, mongo. 
  * `docker-compose logs -f servicename` - attach terimal to log output of a service
  * `docker container ls` — views all the running containers
  * `docker system prune` -- delete all images and volumes to free up space

4. Notes and GOTCHAS
  * note that all environment variables for **REACT** **MUST** be prefixed with `REACT_APP`
  * adding an npm package
    1. start the container and run `docker-compose exec <servicename> bash`
    2. you now have bash shell inside the container. run `npm install <yourPackage> --save`
    3. `exit`
    4. Pro Tip: Download Mongo Compass and use that to view/interact with the DB. 
    5. you're now outside the container, stop, build, and start the container 

### Mongo DB
**query**: {<`field`>: <`value`>} [See documentation](https://docs.mongodb.com/manual/tutorial/query-documents/)
   - one value: {status: "A"}
   - `and`: {status: "A", qty: { $lt: 30 } }
   - `or`: { $or: [ { status: "A" }, { qty: { $lt: 30 } } ] }
  
**compare value**: $lt, $gt, $gte, $lte
   - `$lt`: less than
   - `$lte`: less than equal to
   - `$gt`: greater than
   - `$gte`: greater than equal to

**modification**: 
  - `updateOne`: update 1 document in db
  - `updateMany`: update many documents in db [link](https://docs.mongodb.com/manual/reference/method/db.collection.updateMany/)
  - `find`: find all documents in db
  - `deleteOne`: delete 1 document in db
  - `deleteMany`: delete many documents in db
