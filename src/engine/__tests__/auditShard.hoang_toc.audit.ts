import { describe, it } from 'vitest';
import { runAuditForOrigin } from './auditRunner';

describe('Monte Carlo Audit Shard: hoang_toc', () => {
  it('simulates hoang_toc lifetimes', () => runAuditForOrigin('hoang_toc'), 900000);
});
