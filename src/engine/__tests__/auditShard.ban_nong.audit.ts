import { describe, it } from 'vitest';
import { runAuditForOrigin } from './auditRunner';

describe('Monte Carlo Audit Shard: ban_nong', () => {
  it('simulates ban_nong lifetimes', () => runAuditForOrigin('ban_nong'), 900000);
});
