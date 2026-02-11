import {Link} from 'react-router';
import {useLocalizedPath} from '~/hooks/useLocalePath';

interface ErrorPageProps {
  status: number;
  /** Optional; when not provided we show "Something went wrong" */
  message?: string;
}

export function ErrorPage({status, message = 'Something went wrong'}: ErrorPageProps) {
  const withLocale = useLocalizedPath();

  return (
    <div className="error-page">
      <div className="error-page__content">
        <span className="error-page__status" aria-hidden>
          {status}
        </span>
        <p className="error-page__message">{message}</p>
        <Link
          to={withLocale('/')}
          prefetch="intent"
          className="error-page__link"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
