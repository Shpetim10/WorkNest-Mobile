import { sanitizeAuthFlowToken } from '@/features/auth/utils/token-utils';

import { assertEqual } from './test-helpers';

(() => {
  assertEqual(
    sanitizeAuthFlowToken('  abc123  '),
    'abc123',
    'Should trim surrounding whitespace'
  );
  assertEqual(
    sanitizeAuthFlowToken('%22invitation-token%22'),
    'invitation-token',
    'Should decode and strip wrapped quotes'
  );
  assertEqual(sanitizeAuthFlowToken(undefined), '', 'Should return empty string for undefined');
})();

