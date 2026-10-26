import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  // Accessibilité des templates.
  ...pluginVueA11y.configs['flat/recommended'],
  {
    name: 'app/a11y-overrides',
    rules: {
      // Un champ est associé à son label par `for`/`id` ou par imbrication.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
      // <main> et <h1> reçoivent le focus après une navigation.
      'vuejs-accessibility/no-static-element-interactions': 'off',
    },
  },
  {
    name: 'app/ts-overrides',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
