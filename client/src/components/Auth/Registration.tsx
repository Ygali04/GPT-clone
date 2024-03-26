import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useRegisterUserMutation, useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { TRegisterUser } from 'librechat-data-provider';
import { GoogleIcon, FacebookIcon, OpenIDIcon, GithubIcon, DiscordIcon } from '~/components';
import { ThemeSelector } from '~/components/ui';
import SocialButton from './SocialButton';
import { useLocalize } from '~/hooks';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { data: startupConfig } = useGetStartupConfig();
  const localize = useLocalize();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegisterUser>({ mode: 'onChange' });

  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const registerUser = useRegisterUserMutation();
  const password = watch('password');

  const onRegisterUserFormSubmit = async (data: TRegisterUser) => {
    try {
      await registerUser.mutateAsync(data);
      navigate('/c/new');
    } catch (error) {
      setError(true);
      //@ts-ignore - error is of type unknown
      if (error.response?.data?.message) {
        //@ts-ignore - error is of type unknown
        setErrorMessage(error.response?.data?.message);
      }
    }
  };

  useEffect(() => {
    if (startupConfig?.registrationEnabled === false) {
      navigate('/login');
    }
  }, [startupConfig, navigate]);

  if (!startupConfig) {
    return null;
  }

  const socialLogins = startupConfig.socialLogins ?? [];

  const renderInput = (id: string, label: string, type: string, validation: object) => (
    <div className="mb-2">
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={id}
          aria-label={localize(label)}
          {...register(
            id as 'name' | 'email' | 'username' | 'password' | 'confirm_password',
            validation,
          )}
          aria-invalid={!!errors[id]}
          className="webkit-dark-styles peer block w-full appearance-none rounded-md border border-black/10 bg-white px-2.5 pb-2.5 pt-5 text-sm text-gray-800 focus:border-green-500 focus:outline-none dark:border-white/20 dark:bg-gray-900 dark:text-white dark:focus:border-green-500"
          placeholder=" "
          data-testid={id}
        ></input>
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-2.5 top-4 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-500 duration-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-green-500 dark:text-gray-200"
        >
          {localize(label)}
        </label>
      </div>
      {errors[id] && (
        <span role="alert" className="mt-1 text-sm text-black dark:text-white">
          {String(errors[id]?.message) ?? ''}
        </span>
      )}
    </div>
  );

  const providerComponents = {
    discord: (
      <SocialButton
        key="discord"
        enabled={startupConfig.discordLoginEnabled}
        serverDomain={startupConfig.serverDomain}
        oauthPath="discord"
        Icon={DiscordIcon}
        label={localize('com_auth_discord_login')}
        id="discord"
      />
    ),
    facebook: (
      <SocialButton
        key="facebook"
        enabled={startupConfig.facebookLoginEnabled}
        serverDomain={startupConfig.serverDomain}
        oauthPath="facebook"
        Icon={FacebookIcon}
        label={localize('com_auth_facebook_login')}
        id="facebook"
      />
    ),
    github: (
      <SocialButton
        key="github"
        enabled={startupConfig.githubLoginEnabled}
        serverDomain={startupConfig.serverDomain}
        oauthPath="github"
        Icon={GithubIcon}
        label={localize('com_auth_github_login')}
        id="github"
      />
    ),
    google: (
      <SocialButton
        key="google"
        enabled={startupConfig.googleLoginEnabled}
        serverDomain={startupConfig.serverDomain}
        oauthPath="google"
        Icon={GoogleIcon}
        label={localize('com_auth_google_login')}
        id="google"
      />
    ),
    openid: (
      <SocialButton
        key="openid"
        enabled={startupConfig.openidLoginEnabled}
        serverDomain={startupConfig.serverDomain}
        oauthPath="openid"
        Icon={() =>
          startupConfig.openidImageUrl ? (
            <img src={startupConfig.openidImageUrl} alt="OpenID Logo" className="h-5 w-5" />
          ) : (
            <OpenIDIcon />
          )
        }
        label={startupConfig.openidLabel}
        id="openid"
      />
    ),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white pt-6 dark:bg-gray-900 sm:pt-0">
      <div className="absolute bottom-0 left-0 m-4">
        <ThemeSelector />
      </div>
      <div className="mt-6 w-authPageWidth overflow-hidden bg-white px-6 py-4 dark:bg-gray-900 sm:max-w-md sm:rounded-lg">
        <h1
          className="mb-4 text-center text-3xl font-semibold text-black dark:text-white"
          style={{ userSelect: 'none' }}
        >
          {localize('com_auth_create_account')}
        </h1>
        {error && (
          <div
            className="rounded-md border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-200"
            role="alert"
            data-testid="registration-error"
          >
            {localize('com_auth_error_create')} {errorMessage}
          </div>
        )}
        <form
          className="mt-6"
          aria-label="Registration form"
          method="POST"
          onSubmit={handleSubmit(onRegisterUserFormSubmit)}
        >
          {renderInput('name', 'com_auth_full_name', 'text', {
            required: localize('com_auth_name_required'),
            minLength: {
              value: 3,
              message: localize('com_auth_name_min_length'),
            },
            maxLength: {
              value: 80,
              message: localize('com_auth_name_max_length'),
            },
          })}
          {renderInput('username', 'com_auth_username', 'text', {
            minLength: {
              value: 2,
              message: localize('com_auth_username_min_length'),
            },
            maxLength: {
              value: 80,
              message: localize('com_auth_username_max_length'),
            },
          })}
          {renderInput('email', 'com_auth_email', 'email', {
            required: localize('com_auth_email_required'),
            minLength: {
              value: 1,
              message: localize('com_auth_email_min_length'),
            },
            maxLength: {
              value: 120,
              message: localize('com_auth_email_max_length'),
            },
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: localize('com_auth_email_pattern'),
            },
          })}
          {renderInput('password', 'com_auth_password', 'password', {
            required: localize('com_auth_password_required'),
            minLength: {
              value: 8,
              message: localize('com_auth_password_min_length'),
            },
            maxLength: {
              value: 128,
              message: localize('com_auth_password_max_length'),
            },
          })}
          {renderInput('confirm_password', 'com_auth_password_confirm', 'password', {
            validate: (value) => value === password || localize('com_auth_password_not_match'),
          })}
          <div className="mt-6">
            <button
              disabled={Object.keys(errors).length > 0}
              type="submit"
              aria-label="Submit registration"
              className="w-full transform rounded-md bg-green-500 px-4 py-3 tracking-wide text-white transition-colors duration-200 hover:bg-green-550 focus:bg-green-550 focus:outline-none disabled:cursor-not-allowed disabled:hover:bg-green-500"
            >
              {localize('com_auth_continue')}
            </button>
          </div>
        </form>
        <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
          {localize('com_auth_already_have_account')}{' '}
          <a href="/login" aria-label="Login" className="p-1 font-medium text-green-500">
            {localize('com_auth_login')}
          </a>
        </p>
        {startupConfig.socialLoginEnabled && (
          <>
            {startupConfig.emailLoginEnabled && (
              <>
                <div className="relative mt-6 flex w-full items-center justify-center border border-t uppercase">
                  <div className="absolute bg-white px-3 text-xs text-black dark:bg-gray-900 dark:text-white">
                    Or
                  </div>
                </div>
                <div className="mt-8" />
              </>
            )}
            <div className="mt-2">
              {socialLogins.map((provider) => providerComponents[provider] || null)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Registration;
