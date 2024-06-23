const throttle = require('lodash/throttle');
const { getResponseSender, EModelEndpoint } = require('librechat-data-provider');
const { createAbortController, handleAbortError } = require('~/server/middleware');
const { sendMessage, createOnProgress } = require('~/server/utils');
const { saveMessage, getConvo } = require('~/models');
const { logger } = require('~/config');

const EditController = async (req, res, next, initializeClient) => {
  let {
    text,
    generation,
    endpointOption,
    conversationId,
    modelDisplayLabel,
    responseMessageId,
    isContinued = false,
    parentMessageId = null,
    overrideParentMessageId = null,
  } = req.body;

  logger.debug('[EditController]', {
    text,
    generation,
    isContinued,
    conversationId,
    ...endpointOption,
  });

  let userMessage;
  let promptTokens;
  const sender = getResponseSender({
    ...endpointOption,
    model: endpointOption.modelOptions.model,
    modelDisplayLabel,
  });
  const userMessageId = parentMessageId;
  const user = req.user.id;

  const getReqData = (data = {}) => {
    for (let key in data) {
      if (key === 'userMessage') {
        userMessage = data[key];
      } else if (key === 'responseMessageId') {
        responseMessageId = data[key];
      } else if (key === 'promptTokens') {
        promptTokens = data[key];
      }
    }
  };

  const unfinished = endpointOption.endpoint === EModelEndpoint.google ? false : true;
  const { onProgress: progressCallback, getPartialText } = createOnProgress({
    generation,
    onProgress: throttle(
      ({ text: partialText }) => {
        saveMessage({
          messageId: responseMessageId,
          sender,
          conversationId,
          parentMessageId: overrideParentMessageId ?? userMessageId,
          text: partialText,
          model: endpointOption.modelOptions.model,
          unfinished,
          isEdited: true,
          error: false,
          user,
        });
      },
      3000,
      { trailing: false },
    ),
  });

  const getAbortData = () => ({
    conversationId,
    messageId: responseMessageId,
    sender,
    parentMessageId: overrideParentMessageId ?? userMessageId,
    text: getPartialText(),
    userMessage,
    promptTokens,
  });

  const { abortController, onStart } = createAbortController(req, res, getAbortData);

  res.on('close', () => {
    logger.debug('[EditController] Request closed');
    if (!abortController) {
      return;
    } else if (abortController.signal.aborted) {
      return;
    } else if (abortController.requestCompleted) {
      return;
    }

    abortController.abort();
    logger.debug('[EditController] Request aborted on close');
  });

  try {
    const { client } = await initializeClient({ req, res, endpointOption });

    let response = await client.sendMessage(text, {
      user,
      generation,
      isContinued,
      isEdited: true,
      conversationId,
      parentMessageId,
      responseMessageId,
      overrideParentMessageId,
      getReqData,
      onStart,
      abortController,
      progressCallback,
      progressOptions: {
        res,
        text,
        // parentMessageId: overrideParentMessageId || userMessageId,
      },
    });

    const conversation = await getConvo(user, conversationId);
    conversation.title =
      conversation && !conversation.title ? null : conversation?.title || 'New Chat';

    if (client.options.attachments) {
      conversation.model = endpointOption.modelOptions.model;
    }

    if (!abortController.signal.aborted) {
      sendMessage(res, {
        final: true,
        conversation,
        title: conversation.title,
        requestMessage: userMessage,
        responseMessage: response,
      });
      res.end();

      await saveMessage({ ...response, user });
    }
  } catch (error) {
    const partialText = getPartialText();
    handleAbortError(res, req, error, {
      partialText,
      conversationId,
      sender,
      messageId: responseMessageId,
      parentMessageId: userMessageId ?? parentMessageId,
    });
  }
};

module.exports = EditController;
