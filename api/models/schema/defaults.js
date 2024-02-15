const conversationPreset = {
  // endpoint: [azureOpenAI, openAI, bingAI, anthropic, chatGPTBrowser]
  endpoint: {
    type: String,
    default: null,
    required: true,
  },
  endpointType: {
    type: String,
  },
  // for azureOpenAI, openAI, chatGPTBrowser only
  model: {
    type: String,
    required: false,
  },
  // for azureOpenAI, openAI only
  chatGptLabel: {
    type: String,
    required: false,
  },
  // for google only
  modelLabel: {
    type: String,
    required: false,
  },
  promptPrefix: {
    type: String,
    required: false,
  },
  temperature: {
    type: Number,
    required: false,
  },
  top_p: {
    type: Number,
    required: false,
  },
  // for google only
  topP: {
    type: Number,
    required: false,
  },
  topK: {
    type: Number,
    required: false,
  },
  maxOutputTokens: {
    type: Number,
    required: false,
  },
  presence_penalty: {
    type: Number,
    required: false,
  },
  frequency_penalty: {
    type: Number,
    required: false,
  },
  // for bingai only
  jailbreak: {
    type: Boolean,
  },
  context: {
    type: String,
  },
  systemMessage: {
    type: String,
  },
  toneStyle: {
    type: String,
  },
  file_ids: { type: [{ type: String }], default: undefined },
  // vision
  resendImages: {
    type: Boolean,
  },
  imageDetail: {
    type: String,
  },
  /* assistants */
  assistant_id: {
    type: String,
  },
  instructions: {
    type: String,
  },
};

const agentOptions = {
  model: {
    type: String,
    required: false,
  },
  // for azureOpenAI, openAI only
  chatGptLabel: {
    type: String,
    required: false,
  },
  modelLabel: {
    type: String,
    required: false,
  },
  promptPrefix: {
    type: String,
    required: false,
  },
  temperature: {
    type: Number,
    required: false,
  },
  top_p: {
    type: Number,
    required: false,
  },
  // for google only
  topP: {
    type: Number,
    required: false,
  },
  topK: {
    type: Number,
    required: false,
  },
  maxOutputTokens: {
    type: Number,
    required: false,
  },
  presence_penalty: {
    type: Number,
    required: false,
  },
  frequency_penalty: {
    type: Number,
    required: false,
  },
  context: {
    type: String,
  },
  systemMessage: {
    type: String,
  },
};

module.exports = {
  conversationPreset,
  agentOptions,
};
