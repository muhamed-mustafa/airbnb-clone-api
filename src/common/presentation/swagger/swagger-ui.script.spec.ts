import { runInNewContext } from 'node:vm';
import { buildSwaggerUiCustomJs } from './swagger-ui.script';

describe('Swagger UI decoration observer', () => {
  it('disconnects during DOM updates and resumes observing even when decoration fails', () => {
    let onMutation: () => void = () => undefined;
    const calls: string[] = [];
    const root = { querySelector: () => null };
    const remove = jest.fn(() => calls.push('decorate'));
    class Observer {
      constructor(callback: () => void) {
        onMutation = callback;
      }
      disconnect() {
        calls.push('disconnect');
      }
      observe(target: unknown, options: unknown) {
        expect(target).toBe(root);
        expect(options).toEqual({ childList: true, subtree: true });
        calls.push('observe');
      }
    }

    runInNewContext(buildSwaggerUiCustomJs('test'), {
      window: { MutationObserver: Observer },
      MutationObserver: Observer,
      document: {
        documentElement: { classList: { remove } },
        getElementById: () => root,
        querySelector: () => null,
        querySelectorAll: () => [],
      },
    });

    calls.length = 0;
    onMutation();
    expect(calls).toEqual(['disconnect', 'decorate', 'observe']);

    remove.mockImplementationOnce(() => {
      throw new Error('DOM update failed');
    });
    calls.length = 0;
    expect(onMutation).toThrow('DOM update failed');
    expect(calls).toEqual(['disconnect', 'observe']);
  });
});
