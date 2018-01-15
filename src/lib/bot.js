import { WebClient } from '@slack/client'
import dateUtil from '../helpers/dateUtil'

export class Bot {
  constructor(){
    this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
  }

  postMessage(channel, message) {
    this.slackClient.chat.postMessage(channel, message, {
    })
  }
}

const bot = new Bot
export default bot
