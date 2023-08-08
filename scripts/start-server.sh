curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

source ~/.bashrc

git clone https://github.com/FerreiraRaphael/sound-crime

cd sound-crime

nvm i

nvm use

npm install pm2 -g

pm2 start ./scripts/prod.sh -n sound-crime --time
