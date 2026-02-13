import {redirect} from 'react-router';
import type {Route} from './+types/pages.giggle-monster';

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  return redirect(`/ohku${url.search}`, {status: 301});
}
