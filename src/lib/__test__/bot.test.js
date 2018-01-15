jest.mock('@slack/client');
import { WebClient } from '@slack/client';
import { Bot } from '../bot'

describe('send slack message', () => {

  beforeEach(() => {
  });

  it('should should send the given message with the slack web client', () => {

    const mockPostMessage = jest.fn();
    process.env.SLACK_BOT_TOKEN = 'test token';
    WebClient.mockImplementation(() => {
      return {
        chat: { postMessage: mockPostMessage }
      }
    });

    const testMessage = {text: 'test text'};
    const bot = new Bot()
    bot.postMessage('test channel', testMessage);

    expect(WebClient).toHaveBeenCalledWith('test token');
    expect(mockPostMessage).toHaveBeenCalledWith(
      'test channel',
      // 'test text',
      testMessage,
      {}
    )
  });
});
