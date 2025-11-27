# KvilleNation


### App Structure
* `server` - this directory contains your express app. This is your backend (models, controllers).
* `client` - this directory contains the react app. This is your Frontend (views).
* `docker-compose.yml` - defines the docker ecosystem needed to run the app. 
  

### Local Development
1. Installation  
  * Clone project from GitHub: https://github.com/tentingkville/kvilleNation  
  * Install Docker: https://docs.docker.com/get-docker/  
  * Install MongoDB Compass: https://www.mongodb.com/try/download/compass  
  * If you're using Mac, install docker-sync:  
    https://docker-sync.readthedocs.io/en/latest/getting-started/installation.html
  
2. Set up the Environment  
  * **Set up environment variables using `.env` files**
    * Navigate into the project root:  
      `cd path/to/kvilleNation`
    * Create **two** environment files:
      ```
      server/.env
      client/.env
      ```
    * Get the keys from the shared document.
    * Add each variable in the format:
      ```
      VARIABLE_NAME=your_value_here
      ```
      **For React**, all variables **must** be prefixed with:
      ```
      REACT_APP_
      ```
    * Example:
      ```
      MONGO_URI=mongodb://root:password@mongo:27017/development
      JWT_SECRET=yourSecret

      # In client/.env
      REACT_APP_API_BASE_URL=http://localhost:5000
      ```
    * Restart Docker or restart your dev server after editing `.env` — environment variables only load on startup.

  * **Build docker image and start application**
    * `cd path/to/kvilleNation`
    * `docker compose build` – builds the images (first build takes longer)
    * `docker compose up` – starts the application

  * **Initialize Database**
    * `docker compose exec mongo bash` – get a shell inside the Mongo container  
    * `mongosh --username root --password password` – login  
    * `use development`
    * Run the following code:
      ```javascript
      db.createUser({
        user: "root",
        pwd: "password",
        roles: [
          { role: "dbOwner", db: "development" },
          { role: "readWrite", db: "development" }
        ]
      });
      ```
    * Open MongoDB Compass  
      * New Connection → Advanced Options  
      * Authentication → Username/Password  
      * username = root  
      * password = password  
      * database = development  

    * Add a new user document  
      * Go to "development" DB  
      * If empty → create collection “users”. Otherwise click “users”  
      * Click "Add Data" → "Insert Document"  
      * Add yourself as an admin:
        ```
        {
          "name": "Your Name",
          "netID": "abc123",
          "role": "admin"
        }
        ```

  * **Restart Docker**
    * Close Compass  
    * `^C` to stop  
    * `docker compose stop`  
    * `docker compose up`  

  * **Visit the app**
    * Go to: `http://localhost:3000`  

3. docker-compose commands
  * `docker compose build` – builds images (run this after installing npm packages)
  * `docker compose up` – starts react, express, mongo
  * `docker compose down` – stops & removes containers
  * `docker sync start` – start docker-sync
  * `docker sync stop` – stop docker-sync
  * `docker compose exec <service> bash` – opens bash into react/express/mongo container
  * `docker compose logs -f <service>` – live logs for a service
  * `docker container ls` – list running containers
  * `docker system prune` – removes all unused containers/images/volumes

4. Notes and GOTCHAS
  * All **React environment variables must start with `REACT_APP_`**
  * Adding an npm package:
    1. Container must be running  
    2. Run `docker compose exec <service> bash`  
    3. Inside container: `npm install <package> --save`  
    4. `exit`  
    5. Stop, build, start:  
       `docker compose stop`  
       `docker compose build`  
       `docker compose up`
  * Pro Tip: Use MongoDB Compass to easily inspect the DB

### Mongo DB
**query**: `{ <field>: <value> }`  
Use `$lt`, `$lte`, `$gt`, `$gte`, `$or`, `$and`  

**modification:** `updateOne`, `updateMany`, `find`, `deleteOne`, `deleteMany`