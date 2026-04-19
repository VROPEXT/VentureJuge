import { Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LegalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-amber-900" />
            </div>
            <span className="font-serif font-bold text-lg text-foreground tracking-tight">
              VentureJuge
            </span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* ── MENTIONS LÉGALES ── */}
        <section className="mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs text-gold-500 font-medium uppercase tracking-widest">Informations légales</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-foreground mb-8">Mentions légales</h1>

          <div className="space-y-6 text-sm text-foreground/70 leading-relaxed">

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Éditeur du site</h2>
              <p>Le site <strong className="text-foreground">VentureJuge</strong> (venturejuge.com) est édité par un auto-entrepreneur.</p>
              <ul className="mt-3 space-y-1.5">
                <li><span className="text-foreground font-medium">Statut :</span> Auto-entrepreneur / particulier</li>
                <li><span className="text-foreground font-medium">Pays :</span> Belgique / France</li>
                <li><span className="text-foreground font-medium">Contact :</span> palagniouk.alexban@gmail.com</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Hébergement</h2>
              <p>Le site est hébergé par <strong className="text-foreground">Railway</strong> (Railway Corp., 340 S Lemon Ave #4133, Walnut, CA 91789, USA) et utilise les services <strong className="text-foreground">Supabase</strong> pour la base de données et l'authentification.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Propriété intellectuelle</h2>
              <p>L'ensemble du contenu du site (textes, analyses, logo, design) est la propriété exclusive de l'éditeur. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Données personnelles</h2>
              <p>Les données collectées (email, historique d'analyses) sont utilisées uniquement pour le fonctionnement du service. Elles ne sont jamais vendues à des tiers. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant à <strong className="text-foreground">palagniouk.alexban@gmail.com</strong>.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Cookies</h2>
              <p>Le site utilise uniquement des cookies techniques nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
            </div>
          </div>
        </section>

        {/* ── CGU ── */}
        <section>
          <div className="inline-flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-xs text-gold-500 font-medium uppercase tracking-widest">Utilisation du service</span>
          </div>
          <h2 className="text-3xl font-serif font-black text-foreground mb-8">Conditions Générales d'Utilisation</h2>

          <div className="space-y-5 text-sm text-foreground/70 leading-relaxed">

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">1. Objet</h3>
              <p>Les présentes CGU régissent l'utilisation du service <strong className="text-foreground">VentureJuge</strong>, un outil d'analyse d'idées business disponible sur internet. En utilisant le site, vous acceptez ces conditions dans leur intégralité.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">2. Description du service</h3>
              <p>VentureJuge propose deux niveaux de service :</p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><strong className="text-foreground">Gratuit :</strong> 1 analyse par mois via un moteur local.</li>
                <li><strong className="text-foreground">Premium (4,97 €/mois) :</strong> analyses illimitées par intelligence artificielle avancée, avec plan d'action, analyse concurrentielle et stratégie de croissance.</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">3. Inscription et compte</h3>
              <p>La création d'un compte nécessite une adresse email valide et un mot de passe. Vous êtes responsable de la confidentialité de vos identifiants. Toute utilisation du service via votre compte est réputée effectuée par vous.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">4. Abonnement Premium et paiement</h3>
              <p>L'abonnement Premium est facturé <strong className="text-foreground">4,97 € par mois</strong>, prélevé automatiquement via Stripe (prestataire de paiement sécurisé). L'abonnement est reconduit tacitement chaque mois jusqu'à annulation.</p>
              <p className="mt-2">Vous pouvez annuler à tout moment depuis votre espace compte. L'annulation prend effet à la fin de la période en cours ; vous conservez l'accès Premium jusqu'à cette date.</p>
              <p className="mt-2">Conformément au droit européen, vous disposez d'un délai de rétractation de <strong className="text-foreground">14 jours</strong> à compter de la souscription, sauf si vous avez expressément demandé à bénéficier du service immédiatement.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">5. Limitation de responsabilité</h3>
              <p>Les analyses produites par VentureJuge sont <strong className="text-foreground">indicatives et non contractuelles</strong>. Elles ne remplacent pas un conseil professionnel (avocat, expert-comptable, conseiller en investissement). L'éditeur ne peut être tenu responsable des décisions prises sur la base des résultats fournis.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">6. Utilisation acceptable</h3>
              <p>Il est interdit d'utiliser VentureJuge pour des activités illégales, pour tenter de contourner les limitations du service, ou pour soumettre des contenus offensants ou contraires aux lois en vigueur en Belgique et en France.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">7. Modification des CGU</h3>
              <p>L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email en cas de modification substantielle. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">8. Droit applicable</h3>
              <p>Les présentes CGU sont soumises au droit belge et français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents de Belgique ou de France seront saisis selon la résidence de l'utilisateur.</p>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-4">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
