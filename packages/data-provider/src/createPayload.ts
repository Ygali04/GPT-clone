import type { TSubmission, TMessage, TEndpointOption } from './types';
import { tConvoUpdateSchema, EModelEndpoint, isAssistantsEndpoint } from './schemas';
import { EndpointURLs } from './config';

export default function createPayload(submission: TSubmission) {
  const { conversation, userMessage, messages, endpointOption, isEdited, isContinued } = submission;
  const { conversationId } = tConvoUpdateSchema.parse(conversation);
  const { endpoint, endpointType } = endpointOption as {
    endpoint: EModelEndpoint;
    endpointType?: EModelEndpoint;
  };

  let server = EndpointURLs[endpointType ?? endpoint];

  if (isEdited && isAssistantsEndpoint(endpoint)) {
    server += '/modify';
  } else if (isEdited) {
    server = server.replace('/ask/', '/edit/');
  }

  type Payload = Partial<TMessage> &
    Partial<TEndpointOption> & {
      isContinued: boolean;
      conversationId: string | null;
      messages?: typeof messages;
    };

  const payload: Payload = {
    ...userMessage,
    ...endpointOption,
    isContinued: !!(isEdited && isContinued),
    conversationId,
  };

  return { server, payload };
}
