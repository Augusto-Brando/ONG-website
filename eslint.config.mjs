import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'public/**', 'next-env.d.ts', 'components/ui/**', 'hooks/use-toast.ts'] },
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-img-element': 'off', // imagens vêm do Blob/uploads sem otimização (next.config)
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]

export default config
