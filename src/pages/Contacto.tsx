import LegalPageLayout from "@/components/LegalPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contacto = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensaje enviado",
      description: "Nos pondremos en contacto contigo pronto.",
    });
    setFormData({ nombre: "", email: "", telefono: "", asunto: "", mensaje: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <LegalPageLayout title="Contacto">
      <div className="text-lg text-muted-foreground mb-8 flex flex-col">
        <span className="">
          ¿Tienes alguna pregunta o comentario?
        </span>
        <span>
          Estamos aquí para ayudarte.
        </span>
        <span>
          Completa el formulario o contáctanos directamente.
        </span>
      </div>


      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-card p-8 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-6">Envíanos un mensaje</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="+52 55 1234 5678"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asunto">Asunto</Label>
                <Input
                  id="asunto"
                  name="asunto"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                name="mensaje"
                placeholder="Escribe tu mensaje aquí..."
                rows={5}
                value={formData.mensaje}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              <Send className="mr-2 h-5 w-5" />
              Enviar Mensaje
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">


          <div>
            <h2 className="text-xl font-bold mb-6">Información de Contacto</h2>

            <div className="space-y-6">

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Dirección</h3>
                  <p className="text-muted-foreground">
                    Montes Urales 755<br />
                    Colonia Lomas de Chapultepec<br />
                    Alcaldía Miguel Hidalgo<br />
                    CDMX, CP 11000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Teléfono</h3>
                  <p className="text-muted-foreground">+52 55 9020 7001</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:contacto@increscendofintech.com" className="text-primary hover:underline">contacto@increscendofintech.com</a><br />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horario de Atención</h3>
                  <p className="text-muted-foreground">
                    Servicio: 24/7<br />
                    De lunes a viernes de 9:00 a 17:00 hrs
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </LegalPageLayout>
  );
};

export default Contacto;
