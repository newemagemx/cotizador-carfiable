
import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 text-center text-xs text-muted-foreground w-full">
      <div className="max-w-md mx-auto px-4 space-y-2">
        <p className="font-medium">
          © {new Date().getFullYear()} Carfiable. Todos los derechos reservados.
        </p>
        <p>
          <a 
            href="https://carfiable.mx/aviso-de-privacidad/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center hover:text-primary transition-colors"
          >
            Aviso de Privacidad <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
