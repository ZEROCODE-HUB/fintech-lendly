import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import loanOnboardingImage from "@/assets/loan-onboarding.webp";

interface LoanOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanOnboardingModal({ open, onOpenChange }: LoanOnboardingModalProps) {
  const navigate = useNavigate();

  const handleStart = () => {
    onOpenChange(false);
    navigate('/loan-request');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl md:max-w-3xl max-w-[calc(100%-2rem)] p-4 sm:p-6 md:p-8 flex flex-col items-center gap-4 sm:gap-6 max-h-[90vh] overflow-y-auto rounded-2xl">
        <div className="text-center space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Préstamo Increscendo</h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Fácil y rápido</p>
        </div>

        <div className="w-full flex justify-center px-2 sm:px-0">
          <img
            src={loanOnboardingImage}
            alt="Proceso de préstamo Increscendo"
            className="max-w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-[350px] object-contain"
          />
        </div>

        <Button
          size="lg"
          className="w-full sm:w-auto px-8 sm:px-12 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
          onClick={handleStart}
        >
          Comenzamos
        </Button>
      </DialogContent>
    </Dialog>
  );
}
