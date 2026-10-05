import type { OpenAPIObject, OperationObject, PathItemObject } from '@nestjs/swagger';

export const DOCS_AUDIENCES = ['user', 'admin', 'shared'] as const;
export type DocsAudience = (typeof DOCS_AUDIENCES)[number];
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

type DocsOperation = OperationObject & {
  'x-docs-audience'?: DocsAudience;
  'x-docs-public'?: boolean;
  'x-docs-roles'?: string[];
  'x-docs-access'?: string;
};

export const buildAudienceDocument = (
  source: OpenAPIObject,
  audience: DocsAudience,
): OpenAPIObject => {
  const document = structuredClone(source);
  document.paths = {};
  const usedTags = new Set<string>();

  for (const [path, sourceItem] of Object.entries(source.paths)) {
    const item: PathItemObject = structuredClone(sourceItem);
    let included = false;
    for (const method of HTTP_METHODS) {
      const original: DocsOperation | undefined = sourceItem[method];
      if (!original) continue;
      const roles = original['x-docs-roles'] ?? [];
      const isPublic = original['x-docs-public'] === true;
      const operationAudience =
        original['x-docs-audience'] ?? (isPublic || roles.length !== 1 ? 'shared' : roles[0]);
      if (operationAudience !== audience) {
        delete item[method];
        continue;
      }
      included = true;
      const operation = item[method] as DocsOperation;
      operation['x-docs-audience'] = audience;
      operation['x-docs-access'] = isPublic
        ? 'Public'
        : roles.length
          ? roles.map((role) => (role === 'admin' ? 'Admin' : 'User')).join(' + ')
          : 'Authenticated';
      operation.tags = (operation.tags ?? ['General']).map((tag) => tag.replace(/^Admin \/ /, ''));
      operation.tags.forEach((tag) => usedTags.add(tag));
      if (isPublic) operation.security = [];
      // Match the global response interceptor without double-wrapping paginated lists.
      for (const [status, response] of Object.entries(operation.responses)) {
        if (!response || !/^2\d\d$/.test(status) || '$ref' in response) continue;
        if (status === '204') {
          delete response.content;
          continue;
        }
        const json = response.content?.['application/json'];
        if (!json?.schema) continue;
        const schema = json.schema;
        const resolved =
          '$ref' in schema ? document.components?.schemas?.[schema.$ref.split('/').pop()!] : schema;
        if (resolved && 'properties' in resolved && resolved.properties?.data) continue;
        json.schema = { type: 'object', required: ['data'], properties: { data: schema } };
        if (json.example !== undefined) {
          const value: unknown = json.example;
          json.example = { data: value };
        }
        for (const example of Object.values(json.examples ?? {})) {
          if (!('$ref' in example) && example.value !== undefined) {
            const value: unknown = example.value;
            example.value = { data: value };
          }
        }
      }
    }
    if (included) document.paths[path] = item;
  }

  document.info.title = `${audience[0].toUpperCase()}${audience.slice(1)} API`;
  document.info.description = {
    user: 'User registration and sign-in. Shared APIs contain reference data, current identity, and token refresh.',
    admin:
      'Admin sign-in and resource management. Shared APIs contain reference data, current identity, and token refresh.',
    shared:
      'Reference data and operations used by both applications. Public endpoints need no access token. Token refresh requires a valid refresh token in the request body.',
  }[audience];
  document.tags = [...usedTags].map((name) => ({ name }));
  // Keep only the schemas referenced by this audience, including nested DTOs.
  const schemas = document.components?.schemas;
  if (schemas) {
    const usedSchemas = new Set<string>();
    const visit = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      const object = value as Record<string, unknown>;
      const reference = object.$ref;
      if (typeof reference === 'string' && reference.startsWith('#/components/schemas/')) {
        const name = reference
          .slice('#/components/schemas/'.length)
          .replace(/~1/g, '/')
          .replace(/~0/g, '~');
        if (!usedSchemas.has(name)) {
          usedSchemas.add(name);
          visit(schemas[name]);
        }
      }
      Object.values(object).forEach(visit);
    };
    visit(document.paths);
    visit(document.components?.parameters);
    visit(document.components?.responses);
    document.components!.schemas = Object.fromEntries(
      Object.entries(schemas).filter(([name]) => usedSchemas.has(name)),
    );
  }
  return document;
};
