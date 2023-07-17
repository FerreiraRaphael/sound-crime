import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  "prefix": process.env.BOT_PREFFIX,
  "token": process.env.BOT_TOKEN,
}
