import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Equipo interno de Lucsan Design con acceso al admin de Payload.',
  },
  access: {
    read: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    create: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    update: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
    delete: ({ req }) => Boolean(req.user && req.user.collection === 'admins'),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Owner', value: 'owner' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
