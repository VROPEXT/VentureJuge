import { useState } from "react";
import { X, FileText, Download, Loader2, Crown, ChevronRight, TrendingUp, Users, Target, DollarSign, AlertTriangle, Rocket, Building, BarChart3 } from "lucide-react";
import { BusinessAnalysis } from "@/types/analysis";
import { generateBusinessPlanGemini } from "@/lib/gemini";
import { toast } from "sonner";

interface BusinessPlanModalProps {
  onClose: () => void;
  idea: string;
  analysis: BusinessAnalysis;
}

export function BusinessPlanModal({ onClose, idea, analysis }: BusinessPlanModalProps) {
  const [step, setStep] = useState<"intro" | "generating" | "done">("intro");
  const [plan, setPlan] = useState<any | null>(null);
  const [downloading, setDownloading] = useState(false);

  const generatePlan = async () => {
    setStep("generating");
    try {
      const result = await generateBusinessPlanGemini(idea, analysis);
      setPlan(result);
      setStep("done");
    } catch (err) {
      toast.error("Erreur lors de la génération. Vérifiez votre clé Gemini.");
      setStep("intro");
    }
  };

  const downloadPDF = async () => {
    if (!plan) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210; const margin = 20; const contentW = W - margin * 2;
      let y = 0;

      const addPage = () => { doc.addPage(); y = 25; };
      const checkPage = (needed = 20) => { if (y + needed > 270) addPage(); };
      const writeText = (text: string, fontSize = 10, bold = false, color: [number,number,number] = [60,60,60]) => {
        doc.setFontSize(fontSize); doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text), contentW);
        checkPage(lines.length * (fontSize * 0.4 + 1.5) + 4);
        doc.text(lines, margin, y); y += lines.length * (fontSize * 0.4 + 1.5) + 2;
      };
      const writeSection = (title: string) => {
        checkPage(16); y += 4;
        doc.setFillColor(20,20,30); doc.roundedRect(margin, y-5, contentW, 12, 2, 2, "F");
        doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(212,175,55);
        doc.text(title, margin+4, y+3); y += 12;
      };
      const writeBullet = (text: string) => {
        checkPage(10); doc.setFontSize(9.5); doc.setFont("helvetica","normal"); doc.setTextColor(80,80,80);
        const lines = doc.splitTextToSize(`• ${text}`, contentW-5);
        doc.text(lines, margin+4, y); y += lines.length*5+1.5;
      };

      // Cover
      doc.setFillColor(12,12,20); doc.rect(0,0,210,297,"F");
      doc.setFillColor(212,175,55); doc.rect(0,0,6,297,"F");
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(212,175,55); doc.text("BUSINESS PLAN",20,60);
      doc.setFontSize(26); doc.setFont("helvetica","bold"); doc.setTextColor(240,230,200);
      const titleLines = doc.splitTextToSize(plan.titre,165); doc.text(titleLines,20,75);
      doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(160,150,130); doc.text(plan.date,20,75+titleLines.length*11+8);
      doc.setDrawColor(212,175,55); doc.setLineWidth(0.4); doc.line(20,110,190,110);
      const sumLines = doc.splitTextToSize(plan.executive_summary,165); doc.setFontSize(10); doc.setTextColor(180,170,150); doc.text(sumLines,20,122);
      doc.setFillColor(25,25,35); doc.roundedRect(20,205,80,38,3,3,"F"); doc.roundedRect(110,205,80,38,3,3,"F");
      doc.setFontSize(8); doc.setTextColor(150,140,120); doc.text("SCORE DE RISQUE",30,217); doc.text("POTENTIEL FINANCIER",120,217);
      doc.setFontSize(24); doc.setFont("helvetica","bold"); doc.setTextColor(212,175,55); doc.text(`${analysis.risk.score}`,42,233); doc.text(`${analysis.moneyPotential.score}`,132,233);
      doc.setFontSize(11); doc.setTextColor(150,140,120); doc.text("/100",64,233); doc.text("/100",154,233);
      doc.setFontSize(7.5); doc.setTextColor(100,90,70); doc.text("Généré par VentureJuge — venturejuge.online",20,288);

      addPage();

      writeSection("RÉSUMÉ EXÉCUTIF"); writeText(plan.executive_summary);
      writeSection("DESCRIPTION DU PROJET");
      writeText("Concept",10,true,[30,30,30]); writeText(plan.description_projet.concept,9.5); y+=2;
      writeText("Mission",10,true,[30,30,30]); writeText(plan.description_projet.mission,9.5); y+=2;
      writeText("Vision",10,true,[30,30,30]); writeText(plan.description_projet.vision,9.5); y+=2;
      writeText("Modèle économique",10,true,[30,30,30]); writeText(plan.description_projet.modele_economique,9.5);

      writeSection("ANALYSE DE MARCHÉ");
      writeText("Taille du marché",10,true,[30,30,30]); writeText(plan.analyse_marche.taille_marche,9.5); y+=2;
      writeText("Cible principale",10,true,[30,30,30]); writeText(plan.analyse_marche.cible_principale,9.5); y+=2;
      writeText("Opportunité",10,true,[30,30,30]); writeText(plan.analyse_marche.opportunite,9.5);

      writeSection("CONCURRENCE");
      writeText("Concurrents directs",10,true,[30,30,30]); plan.concurrence.concurrents_directs.forEach(writeBullet); y+=2;
      writeText("Avantage concurrentiel",10,true,[30,30,30]); writeText(plan.concurrence.avantage_concurrentiel,9.5);

      writeSection("PLAN MARKETING");
      writeText("Stratégie",10,true,[30,30,30]); writeText(plan.plan_marketing.strategie,9.5); y+=2;
      writeText("Canaux",10,true,[30,30,30]); plan.plan_marketing.canaux.forEach(writeBullet); y+=2;
      writeText("Message clé",10,true,[30,30,30]); writeText(plan.plan_marketing.message_cle,9.5);

      writeSection("PLAN OPÉRATIONNEL");
      writeText("Structure juridique",10,true,[30,30,30]); writeText(plan.plan_operationnel.structure_juridique,9.5); y+=2;
      writeText("Feuille de route",10,true,[30,30,30]);
      plan.plan_operationnel.etapes_lancement.forEach((e: any) => {
        checkPage(16); doc.setFillColor(235,225,195); doc.roundedRect(margin,y-1,contentW,6,1,1,"F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(80,60,10); doc.text(e.phase,margin+3,y+3.5); y+=8;
        writeText(e.actions,9.5); y+=1;
      });

      writeSection("PLAN FINANCIER");
      writeText("Investissement initial",10,true,[30,30,30]); writeText(plan.plan_financier.investissement_initial,9.5); y+=2;
      writeText("Projections",10,true,[30,30,30]); y+=2;
      const colW=[45,55,65]; checkPage(8);
      doc.setFillColor(212,175,55); doc.rect(margin,y-1,contentW,7,"F");
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(30,20,0);
      let cx=margin+2; ["Période","CA estimé","Résultat"].forEach((h,i)=>{doc.text(h,cx,y+4);cx+=colW[i];}); y+=8;
      plan.plan_financier.previsions.forEach((p: any,i: number) => {
        checkPage(8); doc.setFillColor(i%2===0?248:240,i%2===0?245:237,i%2===0?235:228); doc.rect(margin,y-1,contentW,7,"F");
        doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(50,50,50);
        cx=margin+2; [p.periode,p.ca_estime,p.resultat].forEach((v:any,j:number)=>{doc.text(String(v),cx,y+4);cx+=colW[j];}); y+=8;
      }); y+=4;
      writeText("Point mort",10,true,[30,30,30]); writeText(plan.plan_financier.point_mort,9.5);

      writeSection("RISQUES");
      plan.risques.forEach((r: any) => {
        checkPage(18); doc.setFillColor(255,240,240); doc.roundedRect(margin,y,contentW,16,2,2,"F");
        doc.setFontSize(9.5); doc.setFont("helvetica","bold"); doc.setTextColor(180,30,30); doc.text(`⚠ ${r.risque}`,margin+3,y+6);
        doc.setFont("helvetica","normal"); doc.setTextColor(60,60,60);
        const mLines=doc.splitTextToSize(`→ ${r.mitigation}`,contentW-8); doc.text(mLines,margin+3,y+12); y+=16+mLines.length*4+3;
      });

      writeSection("CONCLUSION"); writeText(plan.conclusion);

      const totalPages = doc.getNumberOfPages();
      for(let i=1;i<=totalPages;i++){
        doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(180,170,150);
        doc.text("VentureJuge — venturejuge.online",margin,291);
        doc.text(`Page ${i} / ${totalPages}`,W-margin,291,{align:"right"});
      }

      doc.save(`BusinessPlan-${plan.titre.replace(/\s+/g,"-")}.pdf`);
      toast.success("PDF téléchargé !");
    } catch (err) {
      toast.error("Erreur lors du téléchargement.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center"><FileText className="w-4 h-4 text-amber-900" /></div>
            <div><h2 className="text-base font-serif font-bold text-foreground">Business Plan</h2><p className="text-xs text-muted-foreground">Généré par IA · VentureJuge</p></div>
          </div>
          <div className="flex items-center gap-2">
            {step === "done" && (
              <button onClick={downloadPDF} disabled={downloading} className="flex items-center gap-2 h-9 px-4 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all">
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? "Export..." : "Télécharger PDF"}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {step === "intro" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-5"><FileText className="w-8 h-8 text-amber-900" /></div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">Générer votre Business Plan</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">Business plan complet basé sur votre analyse : marché, concurrence, plan marketing, projections financières sur 3 ans et feuille de route. Téléchargeable en PDF.</p>
              <button onClick={generatePlan} className="h-12 px-8 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 transition-all glow-gold flex items-center gap-2 mx-auto">
                <Crown className="w-4 h-4" />Générer le Business Plan
              </button>
            </div>
          )}

          {step === "generating" && (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 text-gold-500 animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-foreground mb-2">Génération en cours...</p>
              <p className="text-xs text-muted-foreground">L'IA rédige votre business plan complet</p>
            </div>
          )}

          {step === "done" && plan && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/40 rounded-xl p-5 text-center">
                <p className="text-xs text-gold-500 font-semibold uppercase tracking-widest mb-1">Business Plan</p>
                <h3 className="text-xl font-serif font-bold text-foreground">{plan.titre}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.date}</p>
              </div>

              <Section icon={<FileText className="w-4 h-4 text-gold-500"/>} title="Résumé Exécutif">
                <p className="text-sm text-foreground/80 leading-relaxed">{plan.executive_summary}</p>
              </Section>

              <Section icon={<Building className="w-4 h-4 text-blue-400"/>} title="Description du Projet">
                <Field label="Concept" value={plan.description_projet.concept}/>
                <Field label="Mission" value={plan.description_projet.mission}/>
                <Field label="Vision" value={plan.description_projet.vision}/>
                <Field label="Modèle économique" value={plan.description_projet.modele_economique}/>
              </Section>

              <Section icon={<TrendingUp className="w-4 h-4 text-emerald-400"/>} title="Analyse de Marché">
                <Field label="Taille du marché" value={plan.analyse_marche.taille_marche}/>
                <Field label="Cible principale" value={plan.analyse_marche.cible_principale}/>
                <Field label="Tendances" value={plan.analyse_marche.tendances}/>
                <Field label="Opportunité clé" value={plan.analyse_marche.opportunite}/>
              </Section>

              <Section icon={<BarChart3 className="w-4 h-4 text-purple-400"/>} title="Concurrence">
                <Field label="Concurrents directs">
                  <ul className="space-y-1 mt-1">{plan.concurrence.concurrents_directs.map((c: string,i: number)=><li key={i} className="flex items-start gap-2"><ChevronRight className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0"/><span className="text-sm text-foreground/80">{c}</span></li>)}</ul>
                </Field>
                <Field label="Avantage concurrentiel" value={plan.concurrence.avantage_concurrentiel}/>
              </Section>

              <Section icon={<Target className="w-4 h-4 text-pink-400"/>} title="Plan Marketing">
                <Field label="Stratégie" value={plan.plan_marketing.strategie}/>
                <Field label="Canaux">
                  <div className="flex flex-wrap gap-2 mt-1">{plan.plan_marketing.canaux.map((c: string,i: number)=><span key={i} className="text-xs bg-secondary border border-border rounded-full px-2.5 py-1 text-foreground/80">{c}</span>)}</div>
                </Field>
                <Field label="Message clé" value={plan.plan_marketing.message_cle}/>
              </Section>

              <Section icon={<Rocket className="w-4 h-4 text-orange-400"/>} title="Plan Opérationnel">
                <Field label="Structure juridique" value={plan.plan_operationnel.structure_juridique}/>
                <Field label="Feuille de route">
                  <div className="space-y-2 mt-1">{plan.plan_operationnel.etapes_lancement.map((e: any,i: number)=>(
                    <div key={i} className="bg-secondary/50 rounded-lg p-3"><p className="text-xs font-semibold text-gold-500 mb-1">{e.phase}</p><p className="text-sm text-foreground/80">{e.actions}</p></div>
                  ))}</div>
                </Field>
              </Section>

              <Section icon={<DollarSign className="w-4 h-4 text-green-400"/>} title="Plan Financier">
                <Field label="Investissement initial" value={plan.plan_financier.investissement_initial}/>
                <Field label="Projections">
                  <div className="mt-2 rounded-xl overflow-hidden border border-border">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-amber-900/30"><th className="text-left px-3 py-2 text-gold-500 font-semibold">Période</th><th className="text-left px-3 py-2 text-gold-500 font-semibold">CA estimé</th><th className="text-left px-3 py-2 text-gold-500 font-semibold">Résultat</th></tr></thead>
                      <tbody>{plan.plan_financier.previsions.map((p: any,i: number)=><tr key={i} className={i%2===0?"bg-secondary/30":""}><td className="px-3 py-2 text-foreground/80">{p.periode}</td><td className="px-3 py-2 text-foreground font-medium">{p.ca_estime}</td><td className="px-3 py-2 text-foreground/80">{p.resultat}</td></tr>)}</tbody>
                    </table>
                  </div>
                </Field>
                <Field label="Point mort" value={plan.plan_financier.point_mort}/>
              </Section>

              <Section icon={<AlertTriangle className="w-4 h-4 text-red-400"/>} title="Risques">
                <div className="space-y-2">{plan.risques.map((r: any,i: number)=>(
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <p className="text-sm font-semibold text-red-400 mb-1">⚠ {r.risque}</p>
                    <p className="text-xs text-foreground/70">→ {r.mitigation}</p>
                  </div>
                ))}</div>
              </Section>

              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/40 rounded-xl p-5">
                <p className="text-sm font-semibold text-gold-500 mb-2">Conclusion</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{plan.conclusion}</p>
              </div>

              <button onClick={downloadPDF} disabled={downloading} className="w-full h-12 rounded-xl gold-gradient text-amber-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                {downloading ? "Export en cours..." : "Télécharger le Business Plan en PDF"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({icon,title,children}:{icon:React.ReactNode;title:string;children:React.ReactNode}){
  return <div className="bg-card border border-border rounded-xl overflow-hidden"><div className="flex items-center gap-2 px-4 py-3 bg-secondary/40 border-b border-border">{icon}<h4 className="text-sm font-serif font-semibold text-foreground">{title}</h4></div><div className="p-4 space-y-3">{children}</div></div>;
}

function Field({label,value,children}:{label:string;value?:string;children?:React.ReactNode}){
  return <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>{value&&<p className="text-sm text-foreground/80 leading-relaxed">{value}</p>}{children}</div>;
}
