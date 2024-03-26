/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useGetModelsQuery, useGetSearchEnabledQuery } from 'librechat-data-provider/react-query';
import type { ContextType } from '~/common';
import {
  useAuthContext,
  useServerStream,
  useConversation,
  useAssistantsMap,
  useFileMap,
} from '~/hooks';
import { AssistantsMapContext, FileMapContext } from '~/Providers';
import { Nav, MobileNav } from '~/components/Nav';
import store from '~/store';

export default function Root() {
  const location = useLocation();
  const { newConversation } = useConversation();
  const { isAuthenticated } = useAuthContext();
  const [navVisible, setNavVisible] = useState(() => {
    const savedNavVisible = localStorage.getItem('navVisible');
    return savedNavVisible !== null ? JSON.parse(savedNavVisible) : true;
  });

  const submission = useRecoilValue(store.submission);
  useServerStream(submission ?? null);

  const modelsQueryEnabled = useRecoilValue(store.modelsQueryEnabled);
  const setIsSearchEnabled = useSetRecoilState(store.isSearchEnabled);
  const setModelsConfig = useSetRecoilState(store.modelsConfig);

  const fileMap = useFileMap({ isAuthenticated });
  const assistantsMap = useAssistantsMap({ isAuthenticated });
  const searchEnabledQuery = useGetSearchEnabledQuery({ enabled: isAuthenticated });
  const modelsQuery = useGetModelsQuery({ enabled: isAuthenticated && modelsQueryEnabled });

  useEffect(() => {
    if (modelsQuery.data && location.state?.from?.pathname.includes('/chat')) {
      setModelsConfig(modelsQuery.data);
      // Note: passing modelsQuery.data prevents navigation
      newConversation({}, undefined, modelsQuery.data);
    } else if (modelsQuery.data) {
      setModelsConfig(modelsQuery.data);
    } else if (modelsQuery.isError) {
      console.error('Failed to get models', modelsQuery.error);
    }
  }, [modelsQuery.data, modelsQuery.isError]);

  useEffect(() => {
    if (searchEnabledQuery.data) {
      setIsSearchEnabled(searchEnabledQuery.data);
    } else if (searchEnabledQuery.isError) {
      console.error('Failed to get search enabled', searchEnabledQuery.error);
    }
  }, [searchEnabledQuery.data, searchEnabledQuery.isError]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <FileMapContext.Provider value={fileMap}>
      <AssistantsMapContext.Provider value={assistantsMap}>
        <div className="flex h-dvh">
          <div className="relative z-0 flex h-full w-full overflow-hidden">
            <Nav navVisible={navVisible} setNavVisible={setNavVisible} />
            <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
              <MobileNav setNavVisible={setNavVisible} />
              <Outlet context={{ navVisible, setNavVisible } satisfies ContextType} />
            </div>
          </div>
        </div>
      </AssistantsMapContext.Provider>
    </FileMapContext.Provider>
  );
}
