import type { TDialogProps } from '~/common';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui';
import { useMediaQuery } from '~/hooks';
import { cn } from '~/utils';

export default function Settings({ open, onOpenChange }: TDialogProps) {
  const isSmallScreen = useMediaQuery('(max-width: 767px)');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'shadow-2xl md:min-h-[373px] md:w-[680px]',
          isSmallScreen ? 'top-20 -translate-y-0' : '',
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-800 dark:text-gray-200">
            {'Credits'}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-12">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            This project is built upon LibreChat&apos;s open-source code. We extend our thanks to
            all the members of the LibreChat community and particularly acknowledge the following
            individuals whose contributions have made Bruin Bot possible:
          </p>
          <ul className="mt-4 list-disc pl-8 text-sm text-gray-800 dark:text-gray-200">
            <li>Alex Chen</li>
            <li>Yahvin Gali</li>
            <li>Rohan Adwankar</li>
            <li>Lavinia Lei</li>
            <li>Brandon Tran</li>
            <li>Abeni Liu</li>
            <li>Alicia Liu</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
