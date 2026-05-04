import { Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LegalPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center"><Briefcase className="w-4 h-4 text-amber-900" /></div>
            <span className="font-serif font-bold text-lg text-foreground tracking-tight">VentureJuge</span>
          </div>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />Retour
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12 text-sm text-foreground/70 leading-relaxed">
        <section>
          <h1 className="text-3xl font-serif font-black text-foreground mb-6">Mentions légales</h1>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-foreground mb-2">Éditeur</h2><p>VentureJuge est édité par un auto-entrepreneur. Contact : palagniouk.alexban@gmail.com</p></div>
            <div className="bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-foreground mb-2">Hébergement</h2><p>Hébergé par Vercel Inc. et utilise Supabase pour la base de données.</p></div>
            <div className="bg-card border border-border rounded-xl p-5"><h2 className="font-semibold text-foreground mb-2">Données personnelles (RGPD)</h2><p>Les données collectées (email) sont utilisées uniquement pour le service. Droit d'accès et suppression : palagniouk.alexban@gmail.com</p></div>
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-serif font-black text-foreground mb-6">Conditions Générales d'Utilisation</h2>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5"><h3 className="font-semibold text-foreground mb-2">Service</h3><p>VentureJuge propose une analyse d'idées business. Version gratuite : 1 analyse/mois. Version Premium : 4,97€/mois, analyses illimitées.</p></div>
            <div className="bg-card border border-border rounded-xl p-5"><h3 className="font-semibold text-foreground mb-2">Abonnement & Annulation</h3><p>L'abonnement est mensuel et renouvelé automatiquement. Annulation possible à tout moment depuis votre compte. Vous conservez l'accès jusqu'à la fin de la période. Droit de rétractation de 14 jours.</p></div>
            <div className="bg-card border border-border rounded-xl p-5"><h3 className="font-semibold text-foreground mb-2">Responsabilité</h3><p>Les analyses sont indicatives et ne remplacent pas un conseil professionnel. L'éditeur ne peut être tenu responsable des décisions prises sur base des résultats.</p></div>
            <div className="bg-card border border-border rounded-xl p-5"><h3 className="font-semibold text-foreground mb-2">Droit applicable</h3><p>Droit belge et français. Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p></div>
          </div>
        </section>
      </main>
    </div>
  );
}
