import { AppMap, Moment } from './types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function appSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-app';
}

function getStartMomentId(appMap: AppMap): string | null {
  const targeted = new Set(appMap.edges.map((e) => e.target));
  const roots = appMap.moments.filter((m) => !m.parentMomentId && !targeted.has(m.id));
  return roots[0]?.id ?? appMap.moments.find((m) => !m.parentMomentId)?.id ?? null;
}

/** Transform componentCode from iframe format to standalone React module. */
function transformComponentCode(code: string, momentLabel: string): string {
  let out = code ?? '';

  // window.__SCREEN_COMPONENT__ = function ScreenComponent( → function ScreenComponent(
  out = out.replace(
    /window\.__SCREEN_COMPONENT__\s*=\s*function\s+\w*\s*\(/,
    'function ScreenComponent('
  );
  // Remove trailing semicolon (the assignment ends with };)
  out = out.trimEnd().replace(/;$/, '');

  // Remove `const React = window.React;` lines — React is imported at the top
  out = out.replace(/\bconst\s+React\s*=\s*window\.React\s*;?\s*\n?/g, '');
  // Replace any remaining window.React references
  out = out.replace(/\bwindow\.React\b/g, 'React');
  // window.UI → __UI
  out = out.replace(/\bwindow\.UI\b/g, '__UI');

  if (!out.includes('function ScreenComponent(')) {
    // Fallback: componentCode hasn't been built yet
    out = `function ScreenComponent({ onNavigate }: any) {
  return React.createElement('div', { className: 'flex items-center justify-center min-h-screen bg-zinc-950 text-white' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, ${JSON.stringify(momentLabel)}),
      React.createElement('p', { className: 'text-zinc-400 text-sm' }, 'Screen not yet built — run Build in MomentAI first.')
    )
  );
}`;
  }

  return `'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as __UI from '@/components/ui';

${out}

export default ScreenComponent;
`;
}

// ─── generated file contents ──────────────────────────────────────────────────

function genPackageJson(appMap: AppMap): string {
  return JSON.stringify(
    {
      name: appSlug(appMap.appName),
      version: '0.1.0',
      private: true,
      scripts: { dev: 'next dev', build: 'next build', start: 'next start' },
      dependencies: {
        next: '15.1.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        zustand: '^5.0.0',
        'class-variance-authority': '^0.7.1',
        clsx: '^2.1.1',
        'tailwind-merge': '^3.0.0',
        'lucide-react': '^0.400.0',
        'radix-ui': '^1.4.0',
      },
      devDependencies: {
        typescript: '^5',
        '@types/react': '^19',
        '@types/react-dom': '^19',
        '@types/node': '^20',
        tailwindcss: '^4',
        '@tailwindcss/postcss': '^4',
      },
    },
    null,
    2
  );
}

function genTsConfig(): string {
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2017',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    },
    null,
    2
  );
}

function genNextConfig(): string {
  return `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
`;
}

function genPostcssConfig(): string {
  return `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
export default config;
`;
}

function genGlobalsCss(): string {
  return `@import "tailwindcss";

:root {
  --background: #09090b;
  --foreground: #fafafa;
  --primary: #6366f1;
  --primary-foreground: #ffffff;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #27272a;
  --accent-foreground: #fafafa;
  --destructive: #ef4444;
  --border: #27272a;
  --input: #27272a;
  --ring: #6366f1;
  --radius: 0.5rem;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
`;
}

function genRootLayout(appMap: AppMap): string {
  return `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: ${JSON.stringify(appMap.appName)},
  description: ${JSON.stringify(appMap.appDescription)},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

function genRootPage(startMomentId: string | null): string {
  if (!startMomentId) {
    return `export default function Page() {
  return <div className="p-8 text-white">No screens found.</div>;
}
`;
  }
  return `import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/screens/${startMomentId}');
}
`;
}

function genScreenPage(momentId: string): string {
  return `'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import ScreenComponent from '@/components/screens/${momentId}';

export default function Page() {
  const router = useRouter();
  const store = useAppStore();
  // Build a plain state object (exclude the setField action)
  const { setField, ...state } = store;

  return (
    <ScreenComponent
      state={state}
      onNavigate={(id: string) => router.push(\`/screens/\${id}\`)}
      onStateChange={(key: string, value: unknown) => setField(key, value)}
      onRuntimeAction={async () => ({})}
    />
  );
}
`;
}

function genStoreFile(appMap: AppMap): string {
  const fields = appMap.stateSchema ?? [];
  const initial = appMap.initialState ?? {};

  const typeLines = fields
    .map((f) => {
      const t =
        f.type === 'string[]' ? 'string[]' : f.type === 'enum' ? 'string' : f.type;
      return `  ${f.key}: ${t};`;
    })
    .join('\n');

  const initLines = fields
    .map((f) => {
      const val =
        initial[f.key] ??
        f.defaultValue ??
        (f.type === 'boolean' ? false : f.type === 'number' ? 0 : f.type === 'string[]' ? [] : '');
      return `      ${f.key}: ${JSON.stringify(val)},`;
    })
    .join('\n');

  return `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
${typeLines || '  // no state schema defined'}
  setField: (key: string, value: unknown) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
${initLines || '      // no fields'}
      setField: (key, value) => set((s) => ({ ...s, [key]: value })),
    }),
    { name: ${JSON.stringify(appSlug(appMap.appName) + '-state')} }
  )
);
`;
}

function genUtilsFile(): string {
  return `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
}

/** Single-file UI kit that covers all components used by generated screens. */
function genUiBarrel(): string {
  return `'use client';
export * from './button';
export * from './badge';
export * from './input';
export * from './separator';
export * from './textarea';
export * from './tabs';
export * from './card';
export * from './avatar';
export * from './label';
export * from './select';
export * from './switch';
export * from './dialog';
export * from './sheet';
export * from './dropdown-menu';
`;
}

// ─── shadcn components that don't exist in the project ───────────────────────

function genCardComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm', className)} {...props} />;
}
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('text-base font-semibold leading-tight text-white', className)} {...props} />;
}
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-sm text-zinc-400', className)} {...props} />;
}
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6 pb-6', className)} {...props} />;
}
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center px-6 pb-6', className)} {...props} />;
}
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
`;
}

function genAvatarComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />;
}
function AvatarImage({ className, src, alt = '', ...props }: React.ComponentProps<'img'>) {
  return <img src={src} alt={alt} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />;
}
function AvatarFallback({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex h-full w-full items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-300', className)} {...props} />;
}
export { Avatar, AvatarImage, AvatarFallback };
`;
}

function genLabelComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return <label className={cn('text-sm font-medium text-zinc-200 leading-none', className)} {...props} />;
}
export { Label };
`;
}

function genSelectComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}
const SelectContext = React.createContext<SelectContextValue>({ value: '', onChange: () => {}, open: false, setOpen: () => {} });

function Select({ children, value, defaultValue, onValueChange }: {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? '');
  const [open, setOpen] = React.useState(false);
  const controlled = value !== undefined;
  const current = controlled ? (value ?? '') : internal;
  const onChange = (v: string) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };
  return <SelectContext.Provider value={{ value: current, onChange, open, setOpen }}>{children}</SelectContext.Provider>;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn('flex h-9 w-full items-center justify-between rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none', className)}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span className={value ? '' : 'text-zinc-500'}>{value || placeholder}</span>;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return <div className={cn('absolute z-50 mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 shadow-lg', className)}>{children}</div>;
}

function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { onChange } = React.useContext(SelectContext);
  return (
    <div
      role="option"
      onClick={() => onChange(value)}
      className={cn('cursor-pointer px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700', className)}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
`;
}

function genSwitchComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

function Switch({ checked, defaultChecked, onCheckedChange, className, ...props }: {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  className?: string;
} & Omit<React.ComponentProps<'button'>, 'onChange'>) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false);
  const controlled = checked !== undefined;
  const on = controlled ? (checked ?? false) : internal;
  const toggle = () => {
    if (!controlled) setInternal(!on);
    onCheckedChange?.(!on);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
        on ? 'bg-indigo-600' : 'bg-zinc-700',
        className
      )}
      {...props}
    >
      <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform', on ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}
export { Switch };
`;
}

function genDialogComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogCtx { open: boolean; setOpen: (v: boolean) => void; }
const DialogContext = React.createContext<DialogCtx>({ open: false, setOpen: () => {} });

function Dialog({ children, open, defaultOpen, onOpenChange }: {
  children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const isOpen = controlled ? (open ?? false) : internal;
  const setOpen = (v: boolean) => { if (!controlled) setInternal(v); onOpenChange?.(v); };
  return <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>;
}

function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { onClick: () => setOpen(true) });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={cn('relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl', className)}>
        <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200 text-lg">×</button>
        {children}
      </div>
    </div>
  );
}
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mb-4', className)} {...props} />;
}
function DialogTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-lg font-semibold text-white', className)} {...props} />;
}
function DialogDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-sm text-zinc-400 mt-1', className)} {...props} />;
}
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
`;
}

function genButtonComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'xs';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
  outline: 'border border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800',
  secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
  ghost: 'hover:bg-zinc-800 text-zinc-300',
  link: 'text-indigo-400 underline-offset-4 hover:underline',
};
const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2 text-sm',
  xs: 'h-6 px-2 text-xs rounded-md',
  sm: 'h-8 px-3 text-sm rounded-md',
  lg: 'h-10 px-6 text-sm rounded-md',
  icon: 'h-9 w-9',
};

function Button({ className, variant = 'default', size = 'default', disabled, ...props }: React.ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      disabled={disabled}
      className={cn('inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50', variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
export { Button };
`;
}

function genBadgeComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-indigo-600 text-white',
  secondary: 'bg-zinc-700 text-zinc-200',
  destructive: 'bg-red-600 text-white',
  outline: 'border border-zinc-700 text-zinc-300',
};

function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variantClasses[variant], className)} {...props} />;
}
export { Badge };
`;
}

function genInputComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn('h-9 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50', className)}
      {...props}
    />
  );
}
export { Input };
`;
}

function genTextareaComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn('min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 resize-none', className)}
      {...props}
    />
  );
}
export { Textarea };
`;
}

function genSeparatorComponent(): string {
  return `import * as React from 'react';
import { cn } from '@/lib/utils';

function Separator({ className, orientation = 'horizontal', ...props }: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return <div className={cn('shrink-0 bg-zinc-800', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} {...props} />;
}
export { Separator };
`;
}

function genTabsComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsCtx { value: string; setValue: (v: string) => void; }
const TabsContext = React.createContext<TabsCtx>({ value: '', setValue: () => {} });

function Tabs({ children, defaultValue, value, onValueChange, className, ...props }: {
  children: React.ReactNode; defaultValue?: string; value?: string; onValueChange?: (v: string) => void; className?: string;
}) {
  const [internal, setInternal] = React.useState(defaultValue ?? '');
  const controlled = value !== undefined;
  const current = controlled ? (value ?? '') : internal;
  const setValue = (v: string) => { if (!controlled) setInternal(v); onValueChange?.(v); };
  return <TabsContext.Provider value={{ value: current, setValue }}><div className={className} {...props}>{children}</div></TabsContext.Provider>;
}

function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="tablist" className={cn('inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1', className)} {...props} />;
}

function TabsTrigger({ value, className, children, ...props }: React.ComponentProps<'button'> & { value: string }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn('rounded-md px-3 py-1 text-xs font-medium transition-all', active ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200', className)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, ...props }: React.ComponentProps<'div'> & { value: string }) {
  const { value: current } = React.useContext(TabsContext);
  if (current !== value) return null;
  return <div role="tabpanel" className={cn('mt-3', className)} {...props} />;
}

function ScrollArea({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('overflow-auto', className)} {...props} />;
}
function ScrollBar({ ...props }: React.ComponentProps<'div'>) {
  return <div {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, ScrollArea, ScrollBar };
`;
}

function genDropdownComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface DDCtx { open: boolean; setOpen: (v: boolean) => void; }
const DDContext = React.createContext<DDCtx>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DDContext.Provider value={{ open, setOpen }}><div className="relative inline-block">{children}</div></DDContext.Provider>;
}
function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(DDContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { onClick: () => setOpen(true) });
  }
  return <button onClick={() => setOpen((v) => !v)}>{children}</button>;
}
function DropdownMenuContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(DDContext);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className={cn('absolute right-0 z-50 mt-1 min-w-[8rem] rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-lg', className)}>{children}</div>
    </>
  );
}
function DropdownMenuItem({ className, onClick, ...props }: React.ComponentProps<'div'>) {
  const { setOpen } = React.useContext(DDContext);
  return <div role="menuitem" className={cn('cursor-pointer rounded-md px-2 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700', className)} onClick={(e) => { onClick?.(e); setOpen(false); }} {...props} />;
}
function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-zinc-800', className)} />;
}
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-2 py-1.5 text-xs font-medium text-zinc-500', className)} {...props} />;
}
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel };
`;
}

function genSheetComponent(): string {
  return `'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface SheetCtx { open: boolean; setOpen: (v: boolean) => void; }
const SheetContext = React.createContext<SheetCtx>({ open: false, setOpen: () => {} });

function Sheet({ children, open, defaultOpen, onOpenChange }: {
  children: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (v: boolean) => void;
}) {
  const [internal, setInternal] = React.useState(defaultOpen ?? false);
  const controlled = open !== undefined;
  const isOpen = controlled ? (open ?? false) : internal;
  const setOpen = (v: boolean) => { if (!controlled) setInternal(v); onOpenChange?.(v); };
  return <SheetContext.Provider value={{ open: isOpen, setOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, { onClick: () => setOpen(true) });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

function SheetContent({ children, className, side = 'right' }: {
  children: React.ReactNode; className?: string; side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const { open, setOpen } = React.useContext(SheetContext);
  if (!open) return null;
  const sideClass = side === 'bottom' ? 'inset-x-0 bottom-0 rounded-t-xl' : side === 'left' ? 'inset-y-0 left-0 h-full w-80' : 'inset-y-0 right-0 h-full w-80';
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
      <div className={cn('fixed border border-zinc-700 bg-zinc-900 shadow-xl p-6', sideClass, className)}>
        <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200 text-lg">×</button>
        {children}
      </div>
    </div>
  );
}
function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mb-4', className)} {...props} />;
}
function SheetTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('text-lg font-semibold text-white', className)} {...props} />;
}
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle };
`;
}

function genReadme(appMap: AppMap): string {
  const screens = appMap.moments
    .filter((m) => !m.parentMomentId)
    .map((m) => `- \`/screens/${m.id}\` — ${m.label}`)
    .join('\n');

  return `# ${appMap.appName}

${appMap.appDescription}

Generated by [MomentAI](https://momentai.app) — edit and own this code.

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) — it redirects to the first screen.

## Screens

${screens}

## Stack

- **Next.js 15** (App Router)
- **Zustand** for state management (persisted to localStorage)
- **Tailwind CSS v4** for styling
- **shadcn/ui**-compatible components in \`components/ui/\`

## Customising

- State schema: \`lib/store.ts\`
- Screen components: \`components/screens/\`
- Navigation: each screen page in \`app/screens/[momentId]/page.tsx\`

## Adding a real database

Replace the \`onRuntimeAction\` no-op in each screen page with your own API calls, or wire up Supabase:

\`\`\`bash
npm install @supabase/supabase-js
\`\`\`
`;
}

// ─── public API ───────────────────────────────────────────────────────────────

export interface ExportFile {
  path: string;
  content: string;
}

export function generateNextjsExport(appMap: AppMap): ExportFile[] {
  const startId = getStartMomentId(appMap);
  const topMoments = appMap.moments.filter((m) => !m.parentMomentId);
  const files: ExportFile[] = [];

  // Root config files
  files.push({ path: 'package.json', content: genPackageJson(appMap) });
  files.push({ path: 'tsconfig.json', content: genTsConfig() });
  files.push({ path: 'next.config.ts', content: genNextConfig() });
  files.push({ path: 'postcss.config.mjs', content: genPostcssConfig() });
  files.push({ path: 'README.md', content: genReadme(appMap) });

  // App dir
  files.push({ path: 'app/globals.css', content: genGlobalsCss() });
  files.push({ path: 'app/layout.tsx', content: genRootLayout(appMap) });
  files.push({ path: 'app/page.tsx', content: genRootPage(startId) });

  // One page per top-level moment
  for (const moment of topMoments) {
    files.push({
      path: `app/screens/${moment.id}/page.tsx`,
      content: genScreenPage(moment.id),
    });
  }

  // lib
  files.push({ path: 'lib/utils.ts', content: genUtilsFile() });
  files.push({ path: 'lib/store.ts', content: genStoreFile(appMap) });

  // UI components
  files.push({ path: 'components/ui/index.ts', content: genUiBarrel() });
  files.push({ path: 'components/ui/button.tsx', content: genButtonComponent() });
  files.push({ path: 'components/ui/badge.tsx', content: genBadgeComponent() });
  files.push({ path: 'components/ui/input.tsx', content: genInputComponent() });
  files.push({ path: 'components/ui/textarea.tsx', content: genTextareaComponent() });
  files.push({ path: 'components/ui/separator.tsx', content: genSeparatorComponent() });
  files.push({ path: 'components/ui/tabs.tsx', content: genTabsComponent() });
  files.push({ path: 'components/ui/dropdown-menu.tsx', content: genDropdownComponent() });
  files.push({ path: 'components/ui/card.tsx', content: genCardComponent() });
  files.push({ path: 'components/ui/avatar.tsx', content: genAvatarComponent() });
  files.push({ path: 'components/ui/label.tsx', content: genLabelComponent() });
  files.push({ path: 'components/ui/select.tsx', content: genSelectComponent() });
  files.push({ path: 'components/ui/switch.tsx', content: genSwitchComponent() });
  files.push({ path: 'components/ui/dialog.tsx', content: genDialogComponent() });
  files.push({ path: 'components/ui/sheet.tsx', content: genSheetComponent() });

  // Screen components (transformed componentCode)
  for (const moment of topMoments) {
    files.push({
      path: `components/screens/${moment.id}.tsx`,
      content: transformComponentCode(moment.componentCode ?? '', moment.label),
    });
  }

  return files;
}
