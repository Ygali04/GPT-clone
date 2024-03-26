import { useLocation } from 'react-router-dom';
import { Fragment, useState, memo } from 'react';
import { Download, FileText } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useGetUserBalance, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { TConversation } from 'librechat-data-provider';
import FilesView from '~/components/Chat/Input/Files/FilesView';
import { useAuthContext } from '~/hooks/AuthContext';
import useAvatar from '~/hooks/Messages/useAvatar';
import { ExportModal } from './ExportConversation';
import { LinkIcon, GearIcon } from '~/components';
import { UserIcon } from '~/components/svg';
import { useLocalize } from '~/hooks';
import Settings from './Settings';
import NavLink from './NavLink';
import Logout from './Logout';
import { cn } from '~/utils/';
import store from '~/store';

function NavLinks() {
  const localize = useLocalize();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });
  const [showExports, setShowExports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useRecoilState(store.showFiles);

  const activeConvo = useRecoilValue(store.conversationByIndex(0));
  const globalConvo = useRecoilValue(store.conversation) ?? ({} as TConversation);

  const avatarSrc = useAvatar(user);

  let conversation: TConversation | null | undefined;
  if (location.state?.from?.pathname.includes('/chat')) {
    conversation = globalConvo;
  } else {
    conversation = activeConvo;
  }

  const exportable =
    conversation &&
    conversation.conversationId &&
    conversation.conversationId !== 'new' &&
    conversation.conversationId !== 'search';

  const clickHandler = () => {
    if (exportable) {
      setShowExports(true);
    }
  };

  return (
    <>
      <Menu as="div" className="group relative">
        {({ open }) => (
          <>
            {startupConfig?.checkBalance && balanceQuery.data && (
              <div className="m-1 ml-3 whitespace-nowrap text-left text-sm text-black dark:text-gray-200">
                {`Balance: ${balanceQuery.data}`}
              </div>
            )}
            <Menu.Button
              className={cn(
                'group-ui-open:bg-[#202123] duration-350 mt-text-sm mb-1 flex w-full items-center gap-2.5 rounded-lg bg-[#FFB400]/95 px-2 py-1.5 transition-colors hover:bg-[#202123]',
                open ? 'bg-[#202123]' : 'bg-[#FFB400]/95',
              )}
              data-testid="nav-user"
            >
              <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
                <div className="relative flex">
                  <img
                    className="rounded-full"
                    src={
                      'data:image/png;base64,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' ||
                      `https://api.dicebear.com/6.x/initials/svg?seed=${
                        user?.name || 'User'
                      }&fontFamily=Verdana&fontSize=36`
                    }
                    alt=""
                  />
                </div>
              </div>
              <div
                className="mt-2 grow overflow-hidden text-ellipsis whitespace-nowrap text-left text-black dark:text-white"
                style={{ marginTop: '0', marginLeft: '0' }}
              >
                {user?.name || localize('com_nav_user')}
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-110 transform"
              enterFrom="translate-y-2 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="transition ease-in duration-100 transform"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-2 opacity-0"
            >
              <Menu.Items className="absolute bottom-full left-0 z-20 mb-1 mt-1 w-full translate-y-0 overflow-hidden rounded-lg bg-white py-1.5 opacity-100 outline-none dark:bg-gray-800">
                <Menu.Item as="div">
                  <NavLink
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-3 rounded-none px-3 py-3 text-sm text-black transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700',
                      exportable
                        ? 'cursor-pointer text-black dark:text-white'
                        : 'cursor-not-allowed text-black/50 dark:text-white/50',
                    )}
                    svg={() => <Download size={16} />}
                    text={localize('com_nav_export_conversation')}
                    clickHandler={clickHandler}
                  />
                </Menu.Item>
                <div className="my-1 h-px bg-black/20 dark:bg-white/20" role="none" />
                <Menu.Item as="div">
                  <NavLink
                    className="flex w-full cursor-pointer items-center gap-3 rounded-none px-3 py-3 text-sm text-black transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    svg={() => <FileText className="icon-md" />}
                    text={localize('com_nav_my_files')}
                    clickHandler={() => setShowFiles(true)}
                  />
                </Menu.Item>
                {startupConfig?.helpAndFaqURL !== '/' && (
                  <Menu.Item as="div">
                    <NavLink
                      className="flex w-full cursor-pointer items-center gap-3 rounded-none px-3 py-3 text-sm text-black transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                      svg={() => <LinkIcon />}
                      text={localize('com_nav_help_faq')}
                      clickHandler={() => window.open(startupConfig?.helpAndFaqURL, '_blank')}
                    />
                  </Menu.Item>
                )}
                <Menu.Item as="div">
                  <NavLink
                    className="flex w-full cursor-pointer items-center gap-3 rounded-none px-3 py-3 text-sm text-black transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    svg={() => <GearIcon className="icon-md" />}
                    text={localize('com_nav_settings')}
                    clickHandler={() => setShowSettings(true)}
                  />
                </Menu.Item>
                <div className="my-1 h-px bg-black/20 bg-white/20" role="none" />
                <Menu.Item as="div">
                  <Logout />
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      {showExports && (
        <ExportModal open={showExports} onOpenChange={setShowExports} conversation={conversation} />
      )}
      {showFiles && <FilesView open={showFiles} onOpenChange={setShowFiles} />}
      {showSettings && <Settings open={showSettings} onOpenChange={setShowSettings} />}
    </>
  );
}

export default memo(NavLinks);
