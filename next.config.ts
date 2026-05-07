import { withSentryConfig } from '@sentry/nextjs';
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withSentryConfig(
  withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false })),
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "lucsan-design",

    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Keep client source map uploads narrow to avoid touching Payload admin chunks.
    widenClientFileUpload: false,

    // Removed tunnelRoute: "/monitoring" — could conflict with Payload admin routing/middleware
    // and was a likely cause of the admin client-side error.

    webpack: {
      // Enables automatic instrumentation of Vercel Cron Monitors.
      automaticVercelMonitors: true,

      // Disable React component annotation — injects data-sentry-* attributes into the
      // React tree and can break Payload v3 admin client hydration.
      reactComponentAnnotation: {
        enabled: false,
      },

      // Removed treeshake.removeDebugLogging — was stripping code Payload admin may rely on.
    },
  },
);
