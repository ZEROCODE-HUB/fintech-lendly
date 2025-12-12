import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import loanOnboardingImage from "@/assets/loan-onboarding.png";

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
      <DialogContent className="sm:max-w-2xl md:max-w-3xl p-8 flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Préstamo Increscendo</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Fácil y rápido</p>
        </div>
        
        <div className="w-full flex justify-center">
          <img 
            src={loanOnboardingImage} 
            alt="Proceso de préstamo Increscendo" 
            className="max-w-full h-auto max-h-[300px] sm:max-h-[350px] object-contain"
          />
        </div>

        <Button 
          size="lg" 
          className="px-12 py-3 text-base font-semibold"
          onClick={handleStart}
        >
          Comenzamos
        </Button>
      </DialogContent>
    </Dialog>
  );
}
