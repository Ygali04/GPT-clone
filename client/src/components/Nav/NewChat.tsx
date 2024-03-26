import { useNavigate } from 'react-router-dom';
import { EModelEndpoint } from 'librechat-data-provider';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui';
import { useLocalize, useNewConvo, useLocalStorage } from '~/hooks';
import { icons } from '~/components/Chat/Menus/Endpoints/Icons';
import { NewChatIcon } from '~/components/svg';
import { getEndpointField } from '~/utils';

export default function NewChat({
  toggleNav,
  subHeaders,
}: {
  toggleNav: () => void;
  subHeaders?: React.ReactNode;
}) {
  const { newConversation: newConvo } = useNewConvo();
  const navigate = useNavigate();
  const localize = useLocalize();

  const { data: endpointsConfig } = useGetEndpointsQuery();
  const [convo] = useLocalStorage('lastConversationSetup', { endpoint: EModelEndpoint.openAI });
  const { endpoint } = convo;
  const endpointType = getEndpointField(endpointsConfig, endpoint, 'type');
  const iconURL = getEndpointField(endpointsConfig, endpoint, 'iconURL');
  const iconKey = endpointType ? 'unknown' : endpoint ?? 'unknown';
  const Icon = icons[iconKey];

  const clickHandler = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.ctrlKey) {
      event.preventDefault();
      newConvo();
      navigate('/c/new');
      toggleNav();
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <div className="sticky left-0 right-0 top-0 z-20 bg-gray-50 pt-3.5 dark:bg-gray-750">
          <div className="pb-0.5 last:pb-0" tabIndex={0} style={{ transform: 'none' }}>
            <a
              href="/"
              data-testid="nav-new-chat-button"
              onClick={clickHandler}
              className="group flex h-10 items-center gap-2 rounded-lg px-2 font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <div className="h-7 w-7 flex-shrink-0">
                <div className="shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black dark:bg-white">
                  {endpoint &&
                    Icon &&
                    Icon({
                      size: 41,
                      context: 'nav',
                      className: 'h-2/3 w-2/3',
                      endpoint: endpoint,
                      iconURL: iconURL,
                    })}
                </div>
              </div>
              <div className="text-token-text-primary grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {localize('com_ui_new_chat')}
              </div>
              <div className="flex gap-3">
                <span className="flex items-center" data-state="closed">
                  <TooltipTrigger asChild>
                    <button type="button" className="text-token-text-primary">
                      <NewChatIcon className="h-[18px] w-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={20}>
                    {localize('com_ui_new_chat')}
                  </TooltipContent>
                </span>
              </div>
            </a>
          </div>
          {subHeaders ? subHeaders : null}
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}
