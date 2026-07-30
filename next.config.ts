import type { NextConfig } from 'next';
import { entetesSecurite } from './lib/securite/entetes';

const nextConfig: NextConfig = {
  poweredByHeader: false, // ne pas annoncer la pile technique

  async headers() {
    return [
      {
        // Toutes les routes, y compris la page qui mène au paiement.
        source: '/:chemin*',
        headers: entetesSecurite(),
      },
    ];
  },
};

export default nextConfig;
