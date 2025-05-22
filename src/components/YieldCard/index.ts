import YieldCard from './YieldCard';

export default YieldCard;

// Also export subcomponents if they need to be used individually
export { default as MaturityBadge } from './MaturityBadge';
export { default as YieldInfo } from './YieldInfo';
export { default as YieldActions } from './YieldActions';

// Export types
export * from './types'; 