import TextareaAutosize from 'react-textarea-autosize';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import React, { useEffect, useContext, useRef, useState, useCallback } from 'react';

import { EndpointMenu } from './EndpointMenu';
import SubmitButton from './SubmitButton';
import OptionsBar from './OptionsBar';
import Footer from './Footer';

import { useMessageHandler, ThemeContext } from '~/hooks';
import { cn, getEndpointField } from '~/utils';
import store from '~/store';

interface TextChatProps {
  isSearchView?: boolean;
}

export default function TextChat({ isSearchView = false }: TextChatProps) {
  const { ask, isSubmitting, handleStopGenerating, latestMessage, endpointsConfig } =
    useMessageHandler();
  const conversation = useRecoilValue(store.conversation);
  const setShowBingToneSetting = useSetRecoilState(store.showBingToneSetting);
  const [text, setText] = useRecoilState(store.text);
  const { theme } = useContext(ThemeContext);
  const isComposing = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [hasText, setHasText] = useState(false);

  // TODO: do we need this?
  const disabled = false;

  const isNotAppendable = (latestMessage?.unfinished && !isSubmitting) || latestMessage?.error;
  const { conversationId, jailbreak } = conversation || {};

  // auto focus to input, when entering a conversation.
  useEffect(() => {
    if (!conversationId) {
      return;
    }

    // Prevents Settings from not showing on a new conversation, also prevents showing toneStyle change without jailbreak
    if (conversationId === 'new' || !jailbreak) {
      setShowBingToneSetting(false);
    }

    if (conversationId !== 'search') {
      inputRef.current?.focus();
    }
    // setShowBingToneSetting is a recoil setter, so it doesn't need to be in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, jailbreak]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isSubmitting]);

  const submitMessage = () => {
    ask({ text });
    setText('');
    setHasText(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isSubmitting) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }

    if (e.key === 'Enter' && !e.shiftKey && !isComposing?.current) {
      submitMessage();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode === 8 && e.currentTarget.value.trim() === '') {
      setText(e.currentTarget.value);
    }

    if (e.key === 'Enter' && e.shiftKey) {
      return console.log('Enter + Shift');
    }

    if (isSubmitting) {
      return;
    }
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;

    setText(value);
    updateHasText(value);
  };

  const updateHasText = useCallback(
    (text: string) => {
      setHasText(!!text.trim() || !!latestMessage?.error);
    },
    [setHasText, latestMessage],
  );

  useEffect(() => {
    updateHasText(text);
  }, [text, latestMessage, updateHasText]);

  const getPlaceholderText = () => {
    if (isSearchView) {
      return 'Click a message title to open its conversation.';
    }

    if (disabled) {
      return 'Choose another model or customize GPT again';
    }

    if (isNotAppendable) {
      return 'Edit your message or Regenerate.';
    }

    return '';
  };

  if (isSearchView) {
    return <></>;
  }

  let isDark = theme === 'dark';

  if (theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return (
    <>
      <div
        className="no-gradient-sm fixed bottom-0 left-0 w-full pt-6 sm:bg-gradient-to-b md:absolute md:w-[calc(100%-.5rem)]"
        style={{
          background: `linear-gradient(to bottom, 
                ${isDark ? 'rgba(52, 53, 65, 0)' : 'rgba(255, 255, 255, 0)'}, 
                ${isDark ? 'rgba(52, 53, 65, 0.08)' : 'rgba(255, 255, 255, 0.08)'}, 
                ${isDark ? 'rgba(52, 53, 65, 0.38)' : 'rgba(255, 255, 255, 0.38)'}, 
                ${isDark ? 'rgba(52, 53, 65, 1)' : 'rgba(255, 255, 255, 1)'}, 
                ${isDark ? '#343541' : '#ffffff'})`,
        }}
      >
        <OptionsBar />
        <div className="input-panel md:bg-vert-light-gradient dark:md:bg-vert-dark-gradient relative w-full border-t bg-white py-2 dark:border-white/20 dark:bg-gray-800 md:border-t-0 md:border-transparent md:bg-transparent md:dark:border-transparent md:dark:bg-transparent">
          <form className="stretch z-[60] mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:pt-2 md:last:mb-6 lg:mx-auto lg:max-w-3xl lg:pt-6">
            <div className="relative flex h-full flex-1 md:flex-col">
              <div
                className={cn(
                  'relative flex flex-grow flex-row rounded-xl border border-black/10 py-[10px] md:py-4 md:pl-4',
                  'shadow-[0_0_15px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]',
                  'dark:border-gray-900/50 dark:text-white',
                  disabled ? 'bg-gray-100 dark:bg-gray-900' : 'bg-white dark:bg-gray-700',
                )}
              >
                <EndpointMenu />
                <TextareaAutosize
                  // set test id for e2e testing
                  data-testid="text-input"
                  tabIndex={0}
                  autoFocus
                  ref={inputRef}
                  // style={{maxHeight: '200px', height: '24px', overflowY: 'hidden'}}
                  rows={1}
                  value={disabled || isNotAppendable ? '' : text}
                  onKeyUp={handleKeyUp}
                  onKeyDown={handleKeyDown}
                  onChange={changeHandler}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder={getPlaceholderText()}
                  disabled={disabled || isNotAppendable}
                  className="m-0 flex h-auto max-h-52 flex-1 resize-none overflow-auto border-0 bg-transparent p-0 pl-2 pr-12 leading-6 placeholder:text-sm placeholder:text-gray-600 focus:outline-none focus:ring-0 focus-visible:ring-0 dark:bg-transparent dark:placeholder:text-gray-500 md:pl-2"
                />
                <SubmitButton
                  conversation={conversation}
                  submitMessage={submitMessage}
                  handleStopGenerating={handleStopGenerating}
                  disabled={disabled || isNotAppendable}
                  isSubmitting={isSubmitting}
                  userProvidesKey={
                    conversation?.endpoint
                      ? getEndpointField(endpointsConfig, conversation.endpoint, 'userProvide')
                      : undefined
                  }
                  hasText={hasText}
                />
              </div>
            </div>
          </form>
          <Footer />
        </div>
      </div>
    </>
  );
}
