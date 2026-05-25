import { useToast } from '@/hooks/use-toast';
import { translateError } from './errorMessages';

export const useTranslatedToast = () => {
  const { toast } = useToast();

  const showError = (title: string, error: string | Error | null | undefined) => {
    toast({
      title,
      description: translateError(error),
      variant: 'destructive',
    });
  };

  const showSuccess = (title: string, description: string) => {
    toast({
      title,
      description,
    });
  };

  return {
    showError,
    showSuccess,
  };
};

export { translateError };