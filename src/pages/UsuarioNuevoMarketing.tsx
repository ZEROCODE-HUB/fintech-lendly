import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBusinesswoman from "@/assets/hero-businesswoman.jpg";

const UsuarioNuevoMarketing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(216,45%,8%)] via-[hsl(216,45%,12%)] to-[hsl(216,45%,6%)]">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8 text-center md:text-left">
              {/* Badge */}
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                  Fintech Premium
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Obtén tu membresía{" "}
                <span className="text-[hsl(216,80%,55%)] italic">Increscendo Card</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-300 max-w-lg mx-auto md:mx-0">
                Descubre los beneficios exclusivos que impulsan tu éxito financiero. 
                Seguridad, crecimiento y confianza en cada paso.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  onClick={() => navigate("/memberships")}
                  className="bg-[hsl(216,80%,55%)] hover:bg-[hsl(216,80%,50%)] text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Ver Planes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="border-2 border-gray-500 text-gray-300 hover:bg-white/10 hover:text-white px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300"
                >
                  Más Información
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative flex justify-center md:justify-end">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[hsl(216,80%,55%)/0.2]">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(216,80%,55%)/0.3] via-transparent to-[hsl(216,80%,55%)/0.3] rounded-3xl blur-xl opacity-60" />
                
                {/* Image Container */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10">
                  <img 
                    src={heroBusinesswoman}
                    alt="Profesional de negocios sonriendo"
                    className="w-full max-w-md lg:max-w-lg h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsuarioNuevoMarketing;
