import type { LocaleKey } from "@/lib/locales";
import type { DiagramKey } from "@/diagrams";

export interface FlagshipFigureDefinition {
  diagramKey: DiagramKey;
  label: string;
  caption: string;
  accessibleText: string;
}

type FigureNumber = "1" | "2" | "3" | "4";

const EN_US: Record<FigureNumber, FlagshipFigureDefinition> = {
  "1": {
    diagramKey: "loop-learning",
    label: "Figure 1",
    caption:
      "Single-loop learning returns feedback to strategy and execution, leaving the governing model untouched. Double-loop learning reaches all the way back - questioning the assumptions the model is built on. Most executives are fluent in the first and conditioned against the second.",
    accessibleText:
      "Diagram showing four boxes in sequence: governing model, strategy, actions, and results. A gray feedback loop runs from results back to strategy, representing single-loop learning that corrects execution while leaving the governing model intact. A second oxblood loop runs from results all the way back to the governing model, representing double-loop learning that questions the assumptions beneath strategy itself.",
  },
  "2": {
    diagramKey: "signal-filter",
    label: "Figure 2",
    caption:
      "The signal-to-decision-center gap is a reception problem, not a communication problem. Information that confirms the governing model passes through cleanly. Information that challenges it is attenuated before evaluation begins.",
    accessibleText:
      "Diagram showing a front-line box on the left, a mental model filter in the center, and the decision center on the right. A confirming signal passes through the filter toward the decision center. A challenging signal is diverted, weakened, and marked as blocked before it reaches the decision makers. The visual argues that the bottleneck is not transmission but reception through an existing model.",
  },
  "3": {
    diagramKey: "three-moments",
    label: "Figure 3",
    caption:
      "Three moments in the plasticity window. Where a firm acts in this sequence determines whether transformation is genuinely possible or merely theatrical. Most firms act at moment three - when the crisis is visible and the window has already closed.",
    accessibleText:
      "Timeline diagram with three labeled moments. The first marks the point when revision is needed and still survivable. The second marks a calcified model, where the organization has been built on the old assumptions. The third marks the visible crisis, highlighted in oxblood, where the window has already closed and transformation has become far more costly.",
  },
  "4": {
    diagramKey: "revision-cost",
    label: "Figure 4",
    caption:
      "As the organization layers processes, identity, strategy, and culture on top of the governing model, the cost of revision rises exponentially. The crisis becomes visible only after the window to act without catastrophic cost has already closed.",
    accessibleText:
      "Cost curve diagram with time on the horizontal axis and cost of revision on the vertical axis. A shaded plasticity window sits low and early on the timeline, where revision is still manageable. An oxblood curve rises gradually at first and then sharply upward. A marker shows the window closing before another marker shows the crisis becoming visible, emphasizing that firms usually recognize the problem after revision has become prohibitively expensive.",
  },
};

const EN_GB: Record<FigureNumber, FlagshipFigureDefinition> = {
  "1": {
    ...EN_US["1"],
    caption:
      "Single-loop learning returns feedback to strategy and execution, leaving the governing model untouched. Double-loop learning reaches all the way back - questioning the assumptions the model is built on. Most executives are fluent in the first and conditioned against the second.",
    accessibleText:
      "Diagram showing four boxes in sequence: governing model, strategy, actions, and results. A grey feedback loop runs from results back to strategy, representing single-loop learning that corrects execution while leaving the governing model intact. A second oxblood loop runs from results all the way back to the governing model, representing double-loop learning that questions the assumptions beneath strategy itself.",
  },
  "2": {
    ...EN_US["2"],
    caption:
      "The signal-to-decision-centre gap is a reception problem, not a communication problem. Information that confirms the governing model passes through cleanly. Information that challenges it is attenuated before evaluation begins.",
  },
  "3": {
    ...EN_US["3"],
    caption:
      "Three moments in the plasticity window. Where a firm acts in this sequence determines whether transformation is genuinely possible or merely theatrical. Most firms act at moment three - when the crisis is visible and the window has already closed.",
  },
  "4": {
    ...EN_US["4"],
    caption:
      "As the organisation layers processes, identity, strategy, and culture on top of the governing model, the cost of revision rises exponentially. The crisis becomes visible only after the window to act without catastrophic cost has already closed.",
  },
};

const PT_BR: Record<FigureNumber, FlagshipFigureDefinition> = {
  "1": {
    diagramKey: "loop-learning",
    label: "Figura 1",
    caption:
      "A aprendizagem de circuito simples devolve feedback a estrategia e execucao, mantendo intacto o modelo orientador. A aprendizagem de circuito duplo volta ate a origem e questiona as premissas sobre as quais o modelo foi construido. A maioria dos executivos domina a primeira e resiste, quase por condicionamento, a segunda.",
    accessibleText:
      "Diagrama com quatro blocos em sequencia: modelo orientador, estrategia, acoes e resultados. Um loop cinza volta dos resultados para a estrategia e representa a aprendizagem de circuito simples, que corrige a execucao sem rever o modelo orientador. Um segundo loop, em oxblood, volta dos resultados ate o modelo orientador e representa a aprendizagem de circuito duplo, que questiona as premissas por tras da estrategia.",
  },
  "2": {
    diagramKey: "signal-filter",
    label: "Figura 2",
    caption:
      "A distancia entre o sinal e o centro decisorio e um problema de recepcao, nao de comunicacao. A informacao que confirma o modelo orientador atravessa o filtro com facilidade. A informacao que o desafia e atenuada antes mesmo de ser avaliada.",
    accessibleText:
      "Diagrama com um bloco da linha de frente a esquerda, um filtro de modelo mental no centro e o centro decisorio a direita. Um sinal que confirma o modelo atravessa o filtro e segue adiante. Um sinal que desafia o modelo e desviado, enfraquecido e bloqueado antes de chegar a quem decide. O argumento visual e que o gargalo nao esta na transmissao, mas na recepcao mediada pelo modelo existente.",
  },
  "3": {
    diagramKey: "three-moments",
    label: "Figura 3",
    caption:
      "Tres momentos na janela de plasticidade. O ponto da sequencia em que a firma age determina se a transformacao ainda e real ou se ja virou teatro organizacional. A maioria das empresas age no momento tres, quando a crise fica visivel e a janela ja se fechou.",
    accessibleText:
      "Linha do tempo com tres momentos marcados. O primeiro mostra quando a revisao ja e necessaria e ainda pode ser feita sem colapso. O segundo mostra o modelo calcificado, quando a organizacao inteira ja foi montada sobre as premissas antigas. O terceiro, destacado em oxblood, mostra a crise visivel, quando a janela ja se fechou e a transformacao ficou muito mais cara.",
  },
  "4": {
    diagramKey: "revision-cost",
    label: "Figura 4",
    caption:
      "A medida que a organizacao acumula processos, identidade, estrategia e cultura sobre o modelo orientador, o custo da revisao sobe de forma exponencial. A crise so se torna visivel depois que a janela para agir sem custo catastrofico ja se fechou.",
    accessibleText:
      "Grafico de curva de custo com o tempo no eixo horizontal e o custo de revisao no eixo vertical. Uma faixa sombreada indica a janela de plasticidade no inicio da linha do tempo, quando revisar ainda e suportavel. Uma curva em oxblood sobe devagar no começo e depois dispara. Um marcador mostra o fechamento da janela antes de outro marcador indicar a crise visivel, reforcando que a maioria das firmas reconhece o problema tarde demais.",
  },
};

const PT_PT: Record<FigureNumber, FlagshipFigureDefinition> = {
  "1": {
    diagramKey: "loop-learning",
    label: "Figura 1",
    caption:
      "A aprendizagem de ciclo simples devolve feedback a estrategia e a execucao, mantendo intacto o modelo orientador. A aprendizagem de ciclo duplo recua ate a origem e questiona os pressupostos sobre os quais o modelo foi construido. A maioria dos executivos domina a primeira e resiste, quase por condicionamento, a segunda.",
    accessibleText:
      "Diagrama com quatro blocos em sequencia: modelo orientador, estrategia, acoes e resultados. Um ciclo cinzento regressa dos resultados a estrategia e representa a aprendizagem de ciclo simples, que corrige a execucao sem rever o modelo orientador. Um segundo ciclo, em oxblood, regressa dos resultados ate ao modelo orientador e representa a aprendizagem de ciclo duplo, que questiona os pressupostos por tras da estrategia.",
  },
  "2": {
    diagramKey: "signal-filter",
    label: "Figura 2",
    caption:
      "A distancia entre o sinal e o centro de decisao e um problema de recepcao, nao de comunicacao. A informacao que confirma o modelo orientador atravessa o filtro com facilidade. A informacao que o desafia e atenuada antes mesmo de ser avaliada.",
    accessibleText:
      "Diagrama com um bloco da linha da frente a esquerda, um filtro de modelo mental ao centro e o centro de decisao a direita. Um sinal que confirma o modelo atravessa o filtro e segue em frente. Um sinal que desafia o modelo e desviado, enfraquecido e bloqueado antes de chegar a quem decide. O argumento visual e que o bloqueio nao esta na transmissao, mas na recepcao moldada pelo modelo existente.",
  },
  "3": {
    diagramKey: "three-moments",
    label: "Figura 3",
    caption:
      "Tres momentos na janela de plasticidade. O ponto da sequencia em que a empresa atua determina se a transformacao ainda e real ou se ja se tornou teatral. A maioria das empresas atua no momento tres, quando a crise se torna visivel e a janela ja fechou.",
    accessibleText:
      "Linha temporal com tres momentos assinalados. O primeiro mostra quando a revisao ja e necessaria e ainda pode ser feita sem rutura. O segundo mostra o modelo calcificado, quando a organizacao inteira ja foi montada sobre os pressupostos antigos. O terceiro, destacado em oxblood, mostra a crise visivel, quando a janela ja fechou e a transformacao se tornou muito mais onerosa.",
  },
  "4": {
    diagramKey: "revision-cost",
    label: "Figura 4",
    caption:
      "A medida que a organizacao acumula processos, identidade, estrategia e cultura sobre o modelo orientador, o custo da revisao sobe de forma exponencial. A crise so se torna visivel depois de a janela para agir sem custo catastrofico ja ter fechado.",
    accessibleText:
      "Grafico de curva de custo com o tempo no eixo horizontal e o custo de revisao no eixo vertical. Uma faixa sombreada indica a janela de plasticidade no inicio da linha temporal, quando rever ainda e suportavel. Uma curva em oxblood sobe de forma gradual no inicio e depois dispara. Um marcador mostra o fecho da janela antes de outro marcador assinalar a crise visivel, reforcando que a maioria das empresas reconhece o problema demasiado tarde.",
  },
};

const FR_FR: Record<FigureNumber, FlagshipFigureDefinition> = {
  "1": {
    diagramKey: "loop-learning",
    label: "Figure 1",
    caption:
      "L'apprentissage en simple boucle renvoie le feedback vers la strategie et l'execution, sans toucher au modele directeur. L'apprentissage en double boucle remonte jusqu'a la source et remet en cause les hypotheses sur lesquelles ce modele repose. La plupart des dirigeants maitrisent le premier et resistent, presque par conditionnement, au second.",
    accessibleText:
      "Schema compose de quatre blocs en sequence : modele directeur, strategie, actions et resultats. Une boucle grise repart des resultats vers la strategie et represente l'apprentissage en simple boucle, qui corrige l'execution sans revoir le modele directeur. Une seconde boucle, en oxblood, repart des resultats jusqu'au modele directeur et represente l'apprentissage en double boucle, qui remet en cause les hypotheses situees sous la strategie.",
  },
  "2": {
    diagramKey: "signal-filter",
    label: "Figure 2",
    caption:
      "L'ecart entre le signal et le centre de decision releve d'un probleme de reception, non de communication. L'information qui confirme le modele directeur traverse le filtre sans difficulte. Celle qui le contredit est attenuee avant meme d'etre evaluee.",
    accessibleText:
      "Schema avec un bloc de terrain a gauche, un filtre de modele mental au centre et le centre de decision a droite. Un signal qui confirme le modele traverse le filtre et atteint la decision. Un signal qui le contredit est detourne, affaibli puis bloque avant d'arriver aux decideurs. Le point essentiel est que l'obstacle ne se situe pas dans la transmission, mais dans la reception a travers un modele deja etabli.",
  },
  "3": {
    diagramKey: "three-moments",
    label: "Figure 3",
    caption:
      "Trois moments dans la fenetre de plasticite. L'endroit de la sequence ou l'entreprise agit determine si la transformation reste possible ou si elle devient purement theatrale. La plupart des entreprises agissent au troisieme moment, lorsque la crise devient visible et que la fenetre s'est deja refermee.",
    accessibleText:
      "Frise chronologique avec trois moments identifies. Le premier correspond au moment ou la revision devient necessaire mais reste supportable. Le deuxieme marque le modele fige, lorsque l'organisation s'est deja construite sur les anciennes hypotheses. Le troisieme, mis en valeur en oxblood, correspond a la crise visible, quand la fenetre s'est deja refermee et que la transformation devient beaucoup plus couteuse.",
  },
  "4": {
    diagramKey: "revision-cost",
    label: "Figure 4",
    caption:
      "A mesure que l'organisation empile processus, identite, strategie et culture sur le modele directeur, le cout de revision augmente de facon exponentielle. La crise ne devient visible qu'une fois la fenetre d'action sans cout catastrophique deja refermee.",
    accessibleText:
      "Courbe de cout avec le temps sur l'axe horizontal et le cout de revision sur l'axe vertical. Une zone ombree represente la fenetre de plasticite au debut de la chronologie, quand la revision reste supportable. Une courbe oxblood monte lentement au depart puis s'accelere fortement. Un repere indique la fermeture de la fenetre avant qu'un autre repere signale la crise visible, ce qui montre que les entreprises reconnaissent le probleme trop tard.",
  },
};

const FIGURES_BY_LOCALE: Record<LocaleKey, Record<FigureNumber, FlagshipFigureDefinition>> = {
  "en-us": EN_US,
  "en-gb": EN_GB,
  "pt-br": PT_BR,
  "pt-pt": PT_PT,
  "fr-fr": FR_FR,
};

export const getFlagshipFigureByNumber = (locale: LocaleKey, figure: FigureNumber): FlagshipFigureDefinition =>
  FIGURES_BY_LOCALE[locale][figure] || FIGURES_BY_LOCALE["en-us"][figure];

export const getFlagshipFigureByDiagramKey = (locale: LocaleKey, diagramKey: DiagramKey): FlagshipFigureDefinition | null => {
  const figures = FIGURES_BY_LOCALE[locale] || FIGURES_BY_LOCALE["en-us"];
  return Object.values(figures).find((item) => item.diagramKey === diagramKey) || null;
};
