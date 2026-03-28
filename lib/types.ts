export type MomentType = 'ui' | 'ai' | 'data' | 'auth';

export type RuntimePrimitive = string | number | boolean | null;
export type RuntimeValue =
  | RuntimePrimitive
  | RuntimePrimitive[]
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export interface RuntimeOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  badge?: string;
}

export interface RuntimeStateField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'string[]';
  defaultValue?: RuntimeValue;
  options?: RuntimeOption[];
}

export type RuntimeComponentSpec =
  | {
      id: string;
      type: 'hero';
      title: string;
      body?: string;
      badge?: string;
      align?: 'left' | 'center';
    }
  | {
      id: string;
      type: 'input';
      key: string;
      label: string;
      placeholder?: string;
      helperText?: string;
      inputType?: 'text' | 'email' | 'password' | 'number';
    }
  | {
      id: string;
      type: 'choice-cards';
      key: string;
      label?: string;
      selection: 'single' | 'multiple';
      options: RuntimeOption[];
    }
  | {
      id: string;
      type: 'chip-group';
      key: string;
      label?: string;
      selection: 'single' | 'multiple';
      options: RuntimeOption[];
    }
  | {
      id: string;
      type: 'notice';
      tone: 'info' | 'success' | 'warning';
      title: string;
      body?: string;
    }
  | {
      id: string;
      type: 'summary-card';
      title: string;
      body?: string;
      items?: string[];
    }
  | {
      id: string;
      type: 'stats-grid';
      items: Array<{ label: string; value: string }>;
    }
  | {
      id: string;
      type: 'list';
      title?: string;
      items: string[];
    }
  | {
      id: string;
      type: 'spacer';
      size?: 'sm' | 'md' | 'lg';
    };

export type RuntimeEffectSpec =
  | {
      kind: 'set-values';
      values: Record<string, unknown>;
    }
  | {
      kind: 'append-list';
      key: string;
      item: string;
    };

export interface RuntimeBranch {
  value: string | number | boolean;
  target: string;
}

export interface RuntimeActionSpec {
  id: string;
  label: string;
  kind: 'navigate' | 'branch' | 'back' | 'compute';
  style?: 'primary' | 'secondary' | 'ghost';
  target?: string;
  branchKey?: string;
  branches?: RuntimeBranch[];
  fallbackTarget?: string;
  requiredKeys?: string[];
  effects?: RuntimeEffectSpec[];
  // compute only: key → JS expression using state variable names
  formulas?: Record<string, string>;
}

export interface RuntimeScreenSpec {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  progress?: { current: number; total: number };
  components: RuntimeComponentSpec[];
  actions: RuntimeActionSpec[];
}

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
  parentMomentId?: string; // compound parent moment id — hidden from top-level map until user drills in
  promptTemplate?: string; // displayed in AI implementation panel (type === 'ai' only)
  responseKey?: string;    // state key where AI response is written (defaults to `${id}_response`)
  screenSpec?: RuntimeScreenSpec;
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
  appPlatform?: 'mobile' | 'web';
  runtimeVersion?: 1;
  stateSchema?: RuntimeStateField[];
  initialState?: Record<string, RuntimeValue>;
  journeys: Journey[];
  moments: Moment[];
  edges: FlowEdge[];
}
