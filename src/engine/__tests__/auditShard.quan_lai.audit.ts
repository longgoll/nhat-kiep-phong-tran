import { describe, it } from 'vitest';
import { runAuditForOrigin } from './auditRunner';

describe('Monte Carlo Audit Shard: quan_lai', () => {
  it('simulates quan_lai lifetimes', () => runAuditForOrigin('quan_lai'), 900000);
});
