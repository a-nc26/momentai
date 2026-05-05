/**
 * Builder credits spent per protected API call (1 credit = one abstract unit; tune as needed).
 */
export const CREDIT_CLARIFY_BRIEF = 0; // pre-flight; free
export const CREDIT_GENERATE = 2;
export const CREDIT_ANALYZE_CODEBASE = 2;
export const CREDIT_DEFAULT = 1; // edit, propagate, add-moment, run-moment, generate-mock, single propagate, etc.
export const CREDIT_BUILD_PER_SCREEN = 1; // multiply by screen count in build-app (top-level moments)
