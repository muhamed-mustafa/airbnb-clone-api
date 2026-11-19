import { runInNewContext } from 'node:vm';
import { buildSwaggerUiCustomJs } from './swagger-ui.script';

describe('Swagger UI decoration observer', () => {
  it('stores activation tokens in the customer session even while the admin docs are selected', () => {
    const values = new Map<string, string>();
    const browserWindow = {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    };
    runInNewContext(buildSwaggerUiCustomJs('test', 'admin'), {
      window: browserWindow,
      document: {
        documentElement: { classList: { remove: jest.fn() } },
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
      },
    });
    const bridge = (
      browserWindow as typeof browserWindow & {
        AirbnbCloneApiDocs: {
          storeTokensFromResponse: (
            body: unknown,
            context: { url: string; status: number },
          ) => void;
        };
      }
    ).AirbnbCloneApiDocs;
    bridge.storeTokensFromResponse(
      { data: { accessToken: 'customer-access', refreshToken: 'customer-refresh' } },
      { url: 'http://localhost:3000/api/auth/activation/verify', status: 200 },
    );
    expect(values.get('airbnb-clone-api.docs.user.access-token')).toBe('customer-access');
    expect(values.get('airbnb-clone-api.docs.user.refresh-token')).toBe('customer-refresh');
    expect(values.get('airbnb-clone-api.docs.admin.access-token')).toBeUndefined();
  });
  it('only logs out an existing authorization, avoiding errors in a fresh Swagger session', () => {
    const logout = jest.fn();
    const authorize = jest.fn();
    const authorized = new Map();
    const browserWindow = {
      ui: {
        authActions: { logout, authorize },
        getState: () => new Map([['auth', new Map([['authorized', authorized]])]]),
      },
    };
    runInNewContext(buildSwaggerUiCustomJs('test'), {
      window: browserWindow,
      document: {
        documentElement: { classList: { remove: jest.fn() } },
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: () => [],
      },
    });
    const bridge = (
      browserWindow as typeof browserWindow & {
        AirbnbCloneApiDocs: { authorizeAccessToken: (token: string) => void };
      }
    ).AirbnbCloneApiDocs;
    bridge.authorizeAccessToken('');
    expect(logout).not.toHaveBeenCalled();
    authorized.set('access-token', { value: 'test-only' });
    bridge.authorizeAccessToken('');
    expect(logout).toHaveBeenCalledWith(['access-token']);
    bridge.authorizeAccessToken('test-only');
    expect(authorize).toHaveBeenCalledTimes(1);
  });
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
