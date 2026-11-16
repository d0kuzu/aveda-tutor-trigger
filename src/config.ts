const env = import.meta.env

export const ASSISTANTS = {
  cinta: {
    id: '7de674c1-6029-4609-92c4-074fab740bad',
    label: 'Cinta Aveda Institute (San Francisco / San Jose)',
  },
  canada: {
    id: '194f277c-0911-4ca7-bba2-665036627bc0',
    label: 'Aveda Institute Canada (Winnipeg)',
  },
} as const

export const config = {
  apiBaseUrl: (env.VITE_API_BASE_URL || 'https://api.zerde.co/diaxel').replace(/\/+$/, ''),
  defaultAssistantId: env.VITE_ASSISTANT_ID || ASSISTANTS.cinta.id,
} as const
