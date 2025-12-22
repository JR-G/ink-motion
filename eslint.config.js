import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  ignores: ['dist', 'coverage', 'node_modules', '**/*.md'],
}, {
  rules: {
    'react-refresh/only-export-components': 'off',
  },
})
