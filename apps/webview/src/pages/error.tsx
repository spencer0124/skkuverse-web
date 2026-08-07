import { ErrorPage as SdsErrorPage } from '@skkuverse/ui';

/**
 * Rendered at `/` and at any unmatched path.
 *
 * No retry button. The host answers every unmatched path with the shell at
 * HTTP 200 rather than 404, so arriving here means the address was wrong, not
 * that a request failed — and there is nothing for a retry to do differently.
 * The 404 copy says so; the 500 default ("잠시 후 다시 시도해 주세요") would be
 * a lie about a page that will never exist.
 */
export default function ErrorPage() {
  return <SdsErrorPage statusCode={404} />;
}
