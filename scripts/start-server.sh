curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

source ~/.bashrc

git clone https://github.com/FerreiraRaphael/sound-crime

cd sound-crime

apt update && apt install sudo curl && curl -sL https://raw.githubusercontent.com/Unitech/pm2/master/packager/setup.deb.sh | sudo -E bash -

pm2 start ./scripts/prod.sh -n sound-crime --time
