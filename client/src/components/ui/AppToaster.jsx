import { Toaster } from 'sonner';
import useTheme from '@/hooks/useTheme';

/**
 * Site-wide toast container, styled with the theme tokens.
 * Show a toast anywhere with: import { toast } from 'sonner'; toast.success('...').
 */
export default function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast: '!rounded-lg !border !border-border !bg-surface !text-text !shadow-lg !font-sans',
          description: '!text-muted',
          closeButton: '!border-border !bg-surface !text-muted hover:!text-text',
          success: '[&_[data-icon]]:!text-success',
          error: '[&_[data-icon]]:!text-danger',
        },
      }}
    />
  );
}
