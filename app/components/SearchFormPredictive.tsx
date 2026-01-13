import {
  useFetcher,
  useNavigate,
  type FormProps,
  type Fetcher,
} from 'react-router';
import React, {useRef, useEffect, useState} from 'react';
import type {PredictiveSearchReturn} from '~/lib/search';
import {useAside} from './Aside';
import {usePlaypeak} from '~/lib/playpeakContext';

type SearchFormPredictiveChildren = (args: {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToSearch: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  fetcher: Fetcher<PredictiveSearchReturn>;
  value: string;
}) => React.ReactNode;

type SearchFormPredictiveProps = Omit<FormProps, 'children'> & {
  children: SearchFormPredictiveChildren | null;
};

export const SEARCH_ENDPOINT = '/search';

/**
 *  Search form component that sends search requests to the `/search` route
 **/
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  ...props
}: SearchFormPredictiveProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const aside = useAside();
  // Use PlaypeakContext for closing search drawer (used in SearchDrawer)
  // Fallback to Aside for desktop compatibility
  const playpeakContext = usePlaypeak();
  const [value, setValue] = useState('');

  /** Reset the input value and blur the input */
  function resetInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef?.current?.value) {
      setValue('');
      inputRef.current.blur();
    }
  }

  /** Navigate to the search page with the current input value */
  function goToSearch() {
    const term = inputRef?.current?.value;
    void navigate(SEARCH_ENDPOINT + (term ? `?q=${term}` : ''));
    // Use PlaypeakContext to close search drawer, fallback to Aside for desktop
    if (playpeakContext?.isDrawerOpen('search')) {
      playpeakContext.closeSearchDrawer();
    } else {
      aside.close();
    }
  }

  /** Fetch search results based on the input value */
  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    void fetcher.submit(
      {q: event.target.value || '', limit: 5, predictive: true},
      {method: 'GET', action: SEARCH_ENDPOINT},
    );
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    if (inputRef?.current && inputRef.current instanceof HTMLElement) {
      inputRef.current.setAttribute('type', 'search');
    }
  }, []);

  if (typeof children !== 'function') {
    return null;
  }

  return (
    <fetcher.Form {...props} className={className} onSubmit={resetInput}>
      {children({inputRef, fetcher, fetchResults, goToSearch, value})}
    </fetcher.Form>
  );
}
