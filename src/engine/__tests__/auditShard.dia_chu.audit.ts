import { describe, it } from 'vitest';
import { runAuditForOrigin } from './auditRunner';

describe('Monte Carlo Audit Shard: dia_chu', () => {
  it('simulates dia_chu lifetimes', () => runAuditForOrigin('dia_chu'), 900000);
});
