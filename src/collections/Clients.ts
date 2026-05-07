import type { CollectionConfig } from 'payload'

export const Clients: CollectionConfig = {
  slug: 'clients',
  auth: {
    verify: true,
  },
  admin: {
    useAsTitle: 'email',
    description:
      'Clientes con acceso al portal. Las cuentas las crea un Admin manualmente.',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'admins') return true
      if (req.user.collection === 'clients') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'admins') return true
      if (req.user.collection === 'clients') {
        return { id: { equals: req.user.id } }
      }
      return false
    },
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
    },
    {
      name: 'preferredLanguage',
      type: 'select',
      defaultValue: 'es',
      options: [
        { label: 'Español', value: 'es' },
        { label: 'English', value: 'en' },
      ],
    },
  ],
}
