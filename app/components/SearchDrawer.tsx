import {Link} from 'react-router';
import {useCallback, useEffect, useId, useRef} from 'react';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {Input} from '~/components/ui/Input';
import {MagnifyingGlassIcon, Cross1Icon} from '@radix-ui/react-icons';
import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';

export function SearchDrawer() {
  const queriesDatalistId = useId();
  const { isDrawerOpen, closeSearchDrawer } = usePlaypeak();
  const isOpen = isDrawerOpen('search');
  const localInputRef = useRef<HTMLInputElement | null>(null);

  const focusInput = useCallback(() => {
    const input = localInputRef.current;
    if (!input) return;
    if (document.activeElement !== input) {
      input.focus();
      if (document.activeElement !== input) {
        requestAnimationFrame(() => input.focus());
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => focusInput());
    const timeout = window.setTimeout(() => focusInput(), 350);
    const retry = window.setTimeout(() => focusInput(), 800);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.clearTimeout(retry);
    };
  }, [isOpen, focusInput]);

  useEffect(() => {
    const handleFocusRequest = () => {
      if (!isOpen) return;
      focusInput();
    };
    window.addEventListener('searchdrawer:focus', handleFocusRequest);
    return () => window.removeEventListener('searchdrawer:focus', handleFocusRequest);
  }, [isOpen, focusInput]);

  const handleResultsScroll = useCallback(() => {
    const input = localInputRef.current;
    if (!input) return;
    if (document.activeElement === input) {
      input.blur();
    }
  }, []);

  return (
    <Drawer
      onClose={closeSearchDrawer}
      visible={isOpen}
      position="top"
      className="bg-transparent overflow-hidden m-0! max-w-[390px] tablet:max-w-[600px]"
    >
      <div
        className="predictive-search bg-white m-12 h-full rounded-lg min-h-[300px] tablet:min-h-[400px] max-h-[calc(100vh-180px)]"
        // onTouchStart={focusInput}
        // onPointerDown={focusInput}
      >
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef, value}) => (
            <div className='flex gap-4 p-8 bg-lightGrey'>
              <Input
                name="q"
                value={value}
                handleChange={(value) =>
                  fetchResults({
                    target: {value},
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                placeholder="Search"
                type='text'
                ref={(node) => {
                  inputRef.current = node;
                  localInputRef.current = node;
                }}
                autoFocus={isOpen}
                // list={queriesDatalistId}
                Icon={MagnifyingGlassIcon}
                className="p-8 flex-1"
              />
              <IconButton
                Icon={Cross1Icon}
                variant="secondary"
                size="medium"
                onClick={closeSearchDrawer}
              />
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return (
                <ul className="predictive-search-result-items">
                  <li className="predictive-search-result-item flex w-full mt-8">
                    <div className="mix-blend-darken mr-8">
                      <div className="skeleton-shimmer rounded aspect-square h-[60px] w-[60px]" />
                    </div>
                    <div className="mt-4 space-y-2 flex-1 w-full">
                      <div className="h-4 skeleton-shimmer rounded w-2/3" />
                      <div className="h-4 skeleton-shimmer rounded w-1/3" />
                      <div className="h-12 skeleton-shimmer rounded w-24 mt-4" />
                    </div>
                  </li>
                </ul>
              );
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div
                className="overflow-y-scroll p-12"
                onScroll={handleResultsScroll}
                onTouchMove={handleResultsScroll}
              >
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <Button className="w-full">
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </Button>
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Drawer>
  );
}
