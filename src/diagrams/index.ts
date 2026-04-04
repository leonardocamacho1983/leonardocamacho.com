import { localizeDiagramSvg, type DiagramKey } from "./localization";

import loopLearning from "./loop-learning.svg?raw";
import revisionCost from "./revision-cost.svg?raw";
import signalFilter from "./signal-filter.svg?raw";
import threeMoments from "./three-moments.svg?raw";

export const diagrams: Record<DiagramKey, string> = {
  "loop-learning": loopLearning,
  "revision-cost": revisionCost,
  "signal-filter": signalFilter,
  "three-moments": threeMoments,
};

export type { DiagramKey } from "./localization";

export const getLocalizedDiagramSvg = (diagramKey: DiagramKey, locale: import("@/lib/locales").LocaleKey): string =>
  localizeDiagramSvg(diagrams[diagramKey], diagramKey, locale);
