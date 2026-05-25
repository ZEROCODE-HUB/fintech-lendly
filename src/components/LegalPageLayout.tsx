import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LegalPageLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

const LegalPageLayout = ({
  title,
  children,
  showBackButton = false,
  showHeader = true,
  showFooter = true,
}: LegalPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <header className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="font-semibold text-sm hidden sm:inline">Increscendo Fintech</span>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={cn("pb-16", showHeader ? "pt-20 sm:pt-24" : "pt-16 sm:pt-20")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {showBackButton && (
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-muted-foreground hover:text-foreground -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          )}

          <h1 className="text-xl sm:text-2xl font-bold text-primary mb-4">
            {title}
          </h1>

          <article className="text-sm text-foreground/90 space-y-4">
            {children}
          </article>
        </div>
      </main>

      {showFooter && (
        <footer className="bg-card border-t border-border py-6 sm:py-8 px-4">
          <div className="max-w-4xl mx-auto text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Increscendo Fintech. Todos los derechos reservados.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default LegalPageLayout;