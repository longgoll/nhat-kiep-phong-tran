import { describe, it } from 'vitest';
import { runAuditForOrigin } from './auditRunner';

describe('Monte Carlo Audit Shard: thu_cong', () => {
  it('simulates thu_cong lifetimes', () => runAuditForOrigin('thu_cong'), 900000);
});
