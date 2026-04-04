import type { LocaleKey } from "@/lib/locales";

export type DiagramKey = "loop-learning" | "revision-cost" | "signal-filter" | "three-moments";

const replaceSvgText = (svg: string, replacements: Record<string, string>): string =>
  Object.entries(replacements).reduce(
    (result, [from, to]) => result.replaceAll(from, to),
    svg,
  );

const adjustLoopLearningLayout = (svg: string, locale: LocaleKey): string => {
  if (!["pt-br", "pt-pt", "fr-fr"].includes(locale)) {
    return svg;
  }

  let adjusted = svg
    .replace('x="40" y="197" text-anchor="end"', 'x="68" y="197" text-anchor="start"')
    .replace('x="40" y="308" text-anchor="end"', 'x="68" y="308" text-anchor="start"');

  if (locale === "pt-br") {
    adjusted = adjusted.replace(
      'x="462" y="210" text-anchor="middle"',
      'x="432" y="210" text-anchor="middle"',
    );
  }

  if (locale === "pt-pt") {
    adjusted = adjusted.replace(
      'x="462" y="210" text-anchor="middle"',
      'x="426" y="210" text-anchor="middle"',
    );
  }

  if (locale === "fr-fr") {
    adjusted = adjusted.replace(
      'x="462" y="210" text-anchor="middle"',
      'x="434" y="210" text-anchor="middle"',
    );
  }

  return adjusted;
};

const SVG_REPLACEMENTS: Partial<Record<LocaleKey, Partial<Record<DiagramKey, Record<string, string>>>>> = {
  "en-gb": {
    "signal-filter": {
      "decision center": "decision centre",
      "Decision center": "Decision centre",
    },
  },
  "pt-br": {
    "loop-learning": {
      "Single-loop and double-loop learning diagram": "Diagrama de aprendizagem de circuito simples e circuito duplo",
      "GOVERNING MODEL": "MODELO ORIENTADOR",
      "STRATEGY": "ESTRATÉGIA",
      "ACTIONS": "AÇÕES",
      "RESULTS": "RESULTADOS",
      "Governing model": "Modelo orientador",
      "Assumptions about the world": "Premissas sobre o mundo",
      "Strategy": "Estratégia",
      "Goals and plans": "Objetivos e planos",
      "Actions": "Ações",
      "What the firm does": "O que a firma faz",
      "Results": "Resultados",
      "Loop I": "Circuito I",
      "Single-loop — adjusts tactics, goals stay intact": "Circuito simples — ajusta táticas, metas permanecem intactas",
      "Loop II": "Circuito II",
      "Double-loop — questions the governing model itself": "Circuito duplo — questiona o próprio modelo orientador",
      "Questions assumptions": "Questiona premissas",
      "Corrects execution": "Corrige a execução",
    },
    "revision-cost": {
      "Revision cost curve showing the plasticity window closing over time": "Curva de custo de revisão mostrando o fechamento da janela de plasticidade ao longo do tempo",
      "Time (years of model success)": "Tempo (anos de sucesso do modelo)",
      "Cost of revision": "Custo da revisão",
      "Revision": "Custo",
      "cost": "de revisão",
      "Plasticity window": "Janela de plasticidade",
      "(revision still survivable)": "(revisão ainda suportável)",
      "Window closes": "Janela se fecha",
      "Crisis visible": "Crise visível",
      "Too late": "Tarde demais",
      "Processes": "Processos",
      "Identity": "Identidade",
      "Strategy": "Estratégia",
      "Culture": "Cultura",
    },
    "signal-filter": {
      "Signal filtering diagram showing how mental models block challenging information": "Diagrama de filtragem de sinais mostrando como modelos mentais bloqueiam informações desafiadoras",
      "Signal leads decision by months — but arrives filtered": "O sinal antecede a decisão em meses, mas chega filtrado",
      "Front line": "Linha de frente",
      "Customer signal": "Sinal do cliente",
      "accumulates here": "se acumula aqui",
      "Mental model": "Modelo mental",
      "Filters before": "Filtra antes",
      "evaluation begins": "de a avaliação começar",
      "Confirms model": "Confirma o modelo",
      "Challenges model": "Desafia o modelo",
      "(attenuated)": "(atenuado)",
      "Decision": "Centro",
      "center": "decisório",
      "Not a communication problem.": "Não é um problema de comunicação.",
      "A reception problem.": "É um problema de recepção.",
    },
    "three-moments": {
      "Three-moment timeline showing when revision is needed, when it becomes prohibitive, and when crisis arrives": "Linha do tempo de três momentos mostrando quando a revisão é necessária, quando se torna proibitiva e quando a crise chega",
      "Time": "Tempo",
      "Plasticity window — revision survivable": "Janela de plasticidade — revisão suportável",
      "Revision cost prohibitive": "Custo de revisão proibitivo",
      "Window closed": "Janela fechada",
      "Revision needed": "Revisão necessária",
      "Signal exists, cost is low": "O sinal existe, o custo é baixo",
      "Model calcified": "Modelo calcificado",
      "Organization built on it": "Organização montada sobre ele",
      "Crisis visible": "Crise visível",
      "Transformation too costly": "Transformação cara demais",
      "Where to act": "Onde agir",
      "Where most firms are": "Onde a maioria está",
      "Where most firms act": "Onde a maioria age",
      "The conditions that make change most necessary": "As condições que tornam a mudança mais necessária",
      "are precisely the conditions that make it most costly.": "são precisamente as que a tornam mais custosa.",
    },
  },
  "pt-pt": {
    "loop-learning": {
      "Single-loop and double-loop learning diagram": "Diagrama de aprendizagem em ciclo simples e em ciclo duplo",
      "GOVERNING MODEL": "MODELO ORIENTADOR",
      "STRATEGY": "ESTRATÉGIA",
      "ACTIONS": "AÇÕES",
      "RESULTS": "RESULTADOS",
      "Governing model": "Modelo orientador",
      "Assumptions about the world": "Pressupostos sobre o mundo",
      "Strategy": "Estratégia",
      "Goals and plans": "Objetivos e planos",
      "Actions": "Ações",
      "What the firm does": "O que a empresa faz",
      "Results": "Resultados",
      "Loop I": "Ciclo I",
      "Single-loop — adjusts tactics, goals stay intact": "Ciclo simples — ajusta a táctica, os objectivos mantêm-se",
      "Loop II": "Ciclo II",
      "Double-loop — questions the governing model itself": "Ciclo duplo — questiona o próprio modelo orientador",
      "Questions assumptions": "Questiona pressupostos",
      "Corrects execution": "Corrige a execução",
    },
    "revision-cost": {
      "Revision cost curve showing the plasticity window closing over time": "Curva de custo de revisão mostrando o fecho da janela de plasticidade ao longo do tempo",
      "Time (years of model success)": "Tempo (anos de sucesso do modelo)",
      "Cost of revision": "Custo da revisão",
      "Revision": "Custo",
      "cost": "de revisão",
      "Plasticity window": "Janela de plasticidade",
      "(revision still survivable)": "(revisão ainda suportável)",
      "Window closes": "Janela fecha",
      "Crisis visible": "Crise visível",
      "Too late": "Demasiado tarde",
      "Processes": "Processos",
      "Identity": "Identidade",
      "Strategy": "Estratégia",
      "Culture": "Cultura",
    },
    "signal-filter": {
      "Signal filtering diagram showing how mental models block challenging information": "Diagrama de filtragem de sinais mostrando como os modelos mentais bloqueiam informação desafiante",
      "Signal leads decision by months — but arrives filtered": "O sinal antecede a decisão em meses, mas chega filtrado",
      "Front line": "Linha da frente",
      "Customer signal": "Sinal do cliente",
      "accumulates here": "acumula-se aqui",
      "Mental model": "Modelo mental",
      "Filters before": "Filtra antes",
      "evaluation begins": "de a avaliação começar",
      "Confirms model": "Confirma o modelo",
      "Challenges model": "Desafia o modelo",
      "(attenuated)": "(atenuado)",
      "Decision": "Centro",
      "center": "de decisão",
      "Not a communication problem.": "Não é um problema de comunicação.",
      "A reception problem.": "É um problema de recepção.",
    },
    "three-moments": {
      "Three-moment timeline showing when revision is needed, when it becomes prohibitive, and when crisis arrives": "Linha temporal de três momentos mostrando quando a revisão é necessária, quando se torna proibitiva e quando a crise surge",
      "Time": "Tempo",
      "Plasticity window — revision survivable": "Janela de plasticidade — revisão suportável",
      "Revision cost prohibitive": "Custo de revisão proibitivo",
      "Window closed": "Janela fechada",
      "Revision needed": "Revisão necessária",
      "Signal exists, cost is low": "O sinal existe, o custo é baixo",
      "Model calcified": "Modelo calcificado",
      "Organization built on it": "Organização montada sobre ele",
      "Crisis visible": "Crise visível",
      "Transformation too costly": "Transformação demasiado onerosa",
      "Where to act": "Onde agir",
      "Where most firms are": "Onde a maioria das empresas está",
      "Where most firms act": "Onde a maioria das empresas actua",
      "The conditions that make change most necessary": "As condições que tornam a mudança mais necessária",
      "are precisely the conditions that make it most costly.": "são precisamente as que a tornam mais onerosa.",
    },
  },
  "fr-fr": {
    "loop-learning": {
      "Single-loop and double-loop learning diagram": "Schéma d'apprentissage en simple boucle et en double boucle",
      "GOVERNING MODEL": "MODÈLE DIRECTEUR",
      "STRATEGY": "STRATÉGIE",
      "ACTIONS": "ACTIONS",
      "RESULTS": "RÉSULTATS",
      "Governing model": "Modèle directeur",
      "Assumptions about the world": "Hypothèses sur le monde",
      "Strategy": "Stratégie",
      "Goals and plans": "Objectifs et plans",
      "Actions": "Actions",
      "What the firm does": "Ce que fait l'entreprise",
      "Results": "Résultats",
      "Loop I": "Boucle I",
      "Single-loop — adjusts tactics, goals stay intact": "Boucle simple — ajuste les tactiques, objectifs inchangés",
      "Loop II": "Boucle II",
      "Double-loop — questions the governing model itself": "Boucle double — questionne le modèle directeur",
      "Questions assumptions": "Remet en cause les hypothèses",
      "Corrects execution": "Corrige l'exécution",
    },
    "revision-cost": {
      "Revision cost curve showing the plasticity window closing over time": "Courbe du coût de révision montrant la fermeture de la fenêtre de plasticité au fil du temps",
      "Time (years of model success)": "Temps (années de succès du modèle)",
      "Cost of revision": "Coût de révision",
      "Revision": "Coût",
      "cost": "de révision",
      "Plasticity window": "Fenêtre de plasticité",
      "(revision still survivable)": "(révision encore supportable)",
      "Window closes": "Fenêtre fermée",
      "Crisis visible": "Crise visible",
      "Too late": "Trop tard",
      "Processes": "Processus",
      "Identity": "Identité",
      "Strategy": "Stratégie",
      "Culture": "Culture",
    },
    "signal-filter": {
      "Signal filtering diagram showing how mental models block challenging information": "Schéma de filtrage du signal montrant comment les modèles mentaux bloquent les informations dérangeantes",
      "Signal leads decision by months — but arrives filtered": "Le signal précède la décision de plusieurs mois, mais il arrive filtré",
      "Front line": "Terrain",
      "Customer signal": "Signal client",
      "accumulates here": "s'accumule ici",
      "Mental model": "Modèle mental",
      "Filters before": "Filtre avant",
      "evaluation begins": "que l'évaluation commence",
      "Confirms model": "Confirme le modèle",
      "Challenges model": "Contredit le modèle",
      "(attenuated)": "(atténué)",
      "Decision": "Centre",
      "center": "de décision",
      "Not a communication problem.": "Ce n'est pas un problème de communication.",
      "A reception problem.": "C'est un problème de réception.",
    },
    "three-moments": {
      "Three-moment timeline showing when revision is needed, when it becomes prohibitive, and when crisis arrives": "Frise de trois moments montrant quand la révision devient nécessaire, quand elle devient prohibitive et quand la crise apparaît",
      "Time": "Temps",
      "Plasticity window — revision survivable": "Fenêtre de plasticité — révision supportable",
      "Revision cost prohibitive": "Coût de révision prohibitif",
      "Window closed": "Fenêtre fermée",
      "Revision needed": "Révision nécessaire",
      "Signal exists, cost is low": "Le signal existe, le coût est faible",
      "Model calcified": "Modèle figé",
      "Organization built on it": "Organisation bâtie dessus",
      "Crisis visible": "Crise visible",
      "Transformation too costly": "Transformation trop coûteuse",
      "Where to act": "Où agir",
      "Where most firms are": "Où se trouvent la plupart des entreprises",
      "Where most firms act": "Où agissent la plupart des entreprises",
      "The conditions that make change most necessary": "Les conditions qui rendent le changement le plus nécessaire",
      "are precisely the conditions that make it most costly.": "sont justement celles qui le rendent le plus coûteux.",
    },
  },
};

export const localizeDiagramSvg = (svg: string, diagramKey: DiagramKey, locale: LocaleKey): string => {
  const replacements = SVG_REPLACEMENTS[locale]?.[diagramKey];
  let localized = replacements ? replaceSvgText(svg, replacements) : svg;

  if (diagramKey === "loop-learning") {
    localized = adjustLoopLearningLayout(localized, locale);
  }

  return localized;
};
