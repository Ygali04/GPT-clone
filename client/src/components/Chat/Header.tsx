import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getConfigDefaults } from 'librechat-data-provider';
import { useGetStartupConfig } from 'librechat-data-provider/react-query';
import type { ContextType } from '~/common';
import { EndpointsMenu, ModelSpecsMenu, PresetsMenu, HeaderNewChat } from './Menus';
import HeaderOptions from './Input/HeaderOptions';
import ThemeOptions from './Input/ThemeOptions';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible } = useOutletContext<ContextType>();
  const modelSpecs = useMemo(() => startupConfig?.modelSpecs?.list ?? [], [startupConfig]);
  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-[#FFB400]/95 p-2 font-semibold dark:bg-[#FFB400]/90 dark:text-white ">
      <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto">
        {!navVisible && <HeaderNewChat />}
        {interfaceConfig.endpointsMenu && <EndpointsMenu />}
        {modelSpecs?.length > 0 && <ModelSpecsMenu modelSpecs={modelSpecs} />}
        {<HeaderOptions interfaceConfig={interfaceConfig} />}
        {interfaceConfig.presets && <PresetsMenu />}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
