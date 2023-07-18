export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;

nvm use
npm i
npm run build
npm start
