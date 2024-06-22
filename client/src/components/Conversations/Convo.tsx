import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router-dom';
import { useState, useRef, useMemo } from 'react';
import { EModelEndpoint, LocalStorageKeys } from 'librechat-data-provider';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import type { MouseEvent, FocusEvent, KeyboardEvent } from 'react';
import { useUpdateConversationMutation } from '~/data-provider';
import EndpointIcon from '~/components/Endpoints/EndpointIcon';
import { useConversations, useNavigateToConvo } from '~/hooks';
import { NotificationSeverity } from '~/common';
import { ArchiveIcon } from '~/components/svg';
import { useToastContext } from '~/Providers';
import EditMenuButton from './EditMenuButton';
import ArchiveButton from './ArchiveButton';
import DeleteButton from './DeleteButton';
import RenameButton from './RenameButton';
import HoverToggle from './HoverToggle';
import { cn } from '~/utils';
import store from '~/store';

type KeyEvent = KeyboardEvent<HTMLInputElement>;

export default function Conversation({ conversation, retainView, toggleNav, isLatestConvo }) {
  const params = useParams();
  const currentConvoId = useMemo(() => params.conversationId, [params.conversationId]);
  const updateConvoMutation = useUpdateConversationMutation(currentConvoId ?? '');
  const activeConvos = useRecoilValue(store.allConversationsSelector);
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { refreshConversations } = useConversations();
  const { navigateToConvo } = useNavigateToConvo();
  const { showToast } = useToastContext();

  const { conversationId, title } = conversation;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [titleInput, setTitleInput] = useState(title);
  const [renaming, setRenaming] = useState(false);

  const clickHandler = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && event.ctrlKey) {
      toggleNav();
      return;
    }

    event.preventDefault();
    if (currentConvoId === conversationId) {
      return;
    }

    toggleNav();

    // set document title
    document.title = title;

    // set conversation to the new conversation
    if (conversation?.endpoint === EModelEndpoint.gptPlugins) {
      let lastSelectedTools = [];
      try {
        lastSelectedTools =
          JSON.parse(localStorage.getItem(LocalStorageKeys.LAST_TOOLS) ?? '') ?? [];
      } catch (e) {
        // console.error(e);
      }
      navigateToConvo({
        ...conversation,
        tools: conversation?.tools?.length ? conversation?.tools : lastSelectedTools,
      });
    } else {
      navigateToConvo(conversation);
    }
  };

  const renameHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setTitleInput(title);
    setRenaming(true);
    setTimeout(() => {
      if (!inputRef.current) {
        return;
      }
      inputRef.current.focus();
    }, 25);
  };

  const onRename = (e: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLInputElement> | KeyEvent) => {
    e.preventDefault();
    setRenaming(false);
    if (titleInput === title) {
      return;
    }
    updateConvoMutation.mutate(
      { conversationId, title: titleInput },
      {
        onSuccess: () => refreshConversations(),
        onError: () => {
          setTitleInput(title);
          showToast({
            message: 'Failed to rename conversation',
            severity: NotificationSeverity.ERROR,
            showIcon: true,
          });
        },
      },
    );
  };

  const handleKeyDown = (e: KeyEvent) => {
    if (e.key === 'Escape') {
      setTitleInput(title);
      setRenaming(false);
    } else if (e.key === 'Enter') {
      onRename(e);
    }
  };

  const isActiveConvo =
    currentConvoId === conversationId ||
    (isLatestConvo && currentConvoId === 'new' && activeConvos[0] && activeConvos[0] !== 'new');

  return (
    <div className="hover:bg-token-sidebar-surface-secondary group relative rounded-lg active:opacity-90">
      {renaming ? (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-50 flex w-full items-center rounded-lg bg-gray-200 dark:bg-gray-700">
          <input
            ref={inputRef}
            type="text"
            className="w-full border border-blue-500 bg-transparent p-0 text-sm leading-tight outline-none"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={onRename}
            onKeyDown={handleKeyDown}
          />
        </div>
      ) : (
        <HoverToggle isActiveConvo={isActiveConvo}>
          <EditMenuButton>
            <RenameButton
              renaming={renaming}
              onRename={onRename}
              renameHandler={renameHandler}
              appendLabel={true}
            />
            <DeleteButton
              conversationId={conversationId}
              retainView={retainView}
              renaming={renaming}
              title={title}
              appendLabel={true}
              className="group m-1.5 flex w-full cursor-pointer items-center gap-2 rounded p-2.5 text-sm hover:bg-gray-200 focus-visible:bg-gray-200 focus-visible:outline-0 radix-disabled:pointer-events-none radix-disabled:opacity-50 dark:hover:bg-gray-600 dark:focus-visible:bg-gray-600"
            />
          </EditMenuButton>
          <ArchiveButton
            conversationId={conversationId}
            retainView={retainView}
            shouldArchive={true}
            icon={<ArchiveIcon className="w-full hover:text-gray-400" />}
          />
        </HoverToggle>
      )}
      <a
        href={`/c/${conversationId}`}
        data-testid="convo-item"
        onClick={clickHandler}
        className={cn(
          isActiveConvo
            ? 'group relative mt-2 flex cursor-pointer items-center gap-2 break-all rounded-lg rounded-lg bg-gray-200 px-2 py-2 active:opacity-50 dark:bg-gray-700'
            : 'group relative mt-2 flex grow cursor-pointer items-center gap-2 overflow-hidden whitespace-nowrap break-all rounded-lg rounded-lg px-2 py-2 hover:bg-gray-200 active:opacity-50 dark:hover:bg-gray-800',
          !isActiveConvo && !renaming ? 'peer-hover:bg-gray-200 dark:peer-hover:bg-gray-800' : '',
        )}
        title={title}
      >
        <EndpointIcon
          conversation={conversation}
          endpointsConfig={endpointsConfig}
          size={20}
          context="menu-item"
        />
        {!renaming && (
          <div className="relative line-clamp-1 max-h-5 flex-1 grow overflow-hidden">{title}</div>
        )}
        {isActiveConvo ? (
          <div
            className={cn(
              'absolute bottom-0 right-0 top-0 w-20 rounded-r-lg bg-gradient-to-l',
              !renaming ? 'from-gray-200 from-60% to-transparent dark:from-gray-700' : '',
            )}
          />
        ) : (
          <div className="absolute bottom-0 right-0 top-0 w-2 bg-gradient-to-l from-0% to-transparent group-hover:w-1 group-hover:from-60%" />
        )}
      </a>
    </div>
  );
}
