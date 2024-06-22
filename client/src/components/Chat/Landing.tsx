import { EModelEndpoint } from 'librechat-data-provider';
import { useGetEndpointsQuery, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { ReactNode } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui';
import { useChatContext, useAssistantsMapContext } from '~/Providers';
import ConvoIcon from '~/components/Endpoints/ConvoIcon';
import { BirthdayIcon } from '~/components/svg';
import { getIconEndpoint, cn } from '~/utils';
import { useLocalize } from '~/hooks';

export default function Landing({ Header }: { Header?: ReactNode }) {
  const { conversation } = useChatContext();
  const assistantMap = useAssistantsMapContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { data: endpointsConfig } = useGetEndpointsQuery();

  const localize = useLocalize();

  let { endpoint = '' } = conversation ?? {};
  const { assistant_id = null } = conversation ?? {};

  if (
    endpoint === EModelEndpoint.chatGPTBrowser ||
    endpoint === EModelEndpoint.azureOpenAI ||
    endpoint === EModelEndpoint.gptPlugins
  ) {
    endpoint = EModelEndpoint.openAI;
  }

  const iconURL = conversation?.iconURL;
  endpoint = getIconEndpoint({ endpointsConfig, iconURL, endpoint });

  const assistant = endpoint === EModelEndpoint.assistants && assistantMap?.[assistant_id ?? ''];
  const assistantName = (assistant && assistant?.name) || '';
  const assistantDesc = (assistant && assistant?.description) || '';
  const avatar = (assistant && (assistant?.metadata?.avatar as string)) || '';

  const containerClassName =
    'shadow-stroke relative flex h-full items-center justify-center rounded-full bg-white text-black';

  return (
  // <div className="relative h-full">
  //   <div className="absolute left-0 right-0">{Header && Header}</div>
  //   <div className="flex h-full flex-col items-center justify-center">
  //     <div className="mb-3 h-[72px] w-[72px]">
  //       <div className="gizmo-shadow-stroke relative flex h-full items-center justify-center rounded-full bg-[#FFB400]/95 text-black">
  //         {icons[endpoint ?? 'unknown']({ size: 41, className: 'h-2/3 w-2/3' })}

    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <div className="relative h-full">
          <div className="absolute left-0 right-0">{Header && Header}</div>
          <div className="flex h-full flex-col items-center justify-center">
            <div
              className={cn(
                'relative h-[72px] w-[72px]',
                assistantName && avatar ? 'mb-0' : 'mb-3',
              )}
            >
              <ConvoIcon
                conversation={conversation}
                assistantMap={assistantMap}
                endpointsConfig={endpointsConfig}
                containerClassName={containerClassName}
                context="landing"
                className="h-2/3 w-2/3"
                size={41}
              />
              <TooltipTrigger>
                {(startupConfig?.showBirthdayIcon ?? false) && (
                  <BirthdayIcon className="absolute bottom-12 right-5" />
                )}
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={115} className="left-[20%]">
                {localize('com_ui_happy_birthday')}
              </TooltipContent>
            </div>
            {assistantName ? (
              <div className="flex flex-col items-center gap-0 p-2">
                <div className="text-center text-2xl font-medium dark:text-white">
                  {assistantName}
                </div>
                <div className="text-token-text-secondary max-w-md text-center text-xl font-normal ">
                  {assistantDesc ? assistantDesc : localize('com_nav_welcome_message')}
                </div>
              </div>
            ) : (
              <div className="mb-5 text-2xl font-medium dark:text-white">
                {localize('com_nav_welcome_message')}
              </div>
            )}
          </div>
        </div>
      </Tooltip>
    </TooltipProvider>

  //       </div >
  //     </div >
  //     <div className="text-center text-xl font-medium dark:text-white">Go Bruins!</div>
  //   </div >
  // </div >
  );
}
