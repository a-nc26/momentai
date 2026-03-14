export type MomentType = 'ui' | 'ai' | 'data' | 'auth';

export interface Moment {
  id: string;
  journeyId: string;
  label: string;
  description: string;
  type: MomentType;
  preview: string;
  position: { x: number; y: number };
  mockHtml?: string;
  branchOf?: string; // parent node id — this node is hidden until parent is clicked
  promptTemplate?: string; // displayed in AI implementation panel (type === 'ai' only)
}

export interface Journey {
  id: string;
  name: string;
  description: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface AppMap {
  appName: string;
  appDescription: string;
  journeys: Journey[];
  moments: Moment[];
  edges: FlowEdge[];
}
