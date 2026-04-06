import type { PropsWithChildren, ReactElement } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';

import { createTestQueryClient } from './createTestQueryClient';

export function renderWithQueryClient(ui: ReactElement, queryClient: QueryClient = createTestQueryClient()) {
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper })
  };
}
