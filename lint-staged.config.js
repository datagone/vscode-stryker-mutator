module.exports = {
  '**/*.{ts,js,json,md}': ['prettier --write'],
  '**/*.{ts,js}': ['eslint --max-warnings 0 --fix'],
};
