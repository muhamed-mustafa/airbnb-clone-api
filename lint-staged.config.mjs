export default {
  '{src,test}/**/*.ts': ['eslint --fix', 'prettier --write'],
  '*.{js,mjs,cjs,json,md,yml,yaml}': ['prettier --write'],
};
