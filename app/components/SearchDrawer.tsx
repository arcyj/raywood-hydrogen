import {Link} from 'react-router';
import {useCallback, useEffect, useId, useRef} from 'react';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {Input} from '~/components/ui/Input';
import {MagnifyingGlassIcon, Cross1Icon} from '@radix-ui/react-icons';
import { VaulDrawer } from './ui/vaulDrawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { useBreakpoints } from '~/hooks/useBreakpoints';
import { useTranslation } from '~/lib/i18nContext';

export function SearchDrawer() {
  const queriesDatalistId = useId();
  const { isDrawerOpen, closeSearchDrawer, searchInputRef } = usePlaypeak();
  const { t } = useTranslation();
  const isOpen = isDrawerOpen('search');
  const { isTablet } = useBreakpoints();


  const ghostInputRef = useRef<HTMLInputElement | null>(null);
  const realInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    searchInputRef.current = ghostInputRef.current;
    return () => {
      searchInputRef.current = null;
    };
  }, [searchInputRef]);

  useEffect(() => {
    if (!isOpen) {
      searchInputRef.current = ghostInputRef.current;
      return;
    }

    const timeout = window.setTimeout(() => {
      const input = realInputRef.current;
      if (!input) return;
      searchInputRef.current = input;
      input.focus();
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [isOpen, searchInputRef]);

  const realInputRefCallback = useCallback(
    (node: HTMLInputElement | null) => {
      realInputRef.current = node;
      if (!node) {
        searchInputRef.current = ghostInputRef.current;
      }
    },
    [searchInputRef],
  );

  const handleResultsScroll = useCallback(() => {
    const input = realInputRef.current;
    if (!input) return;
    if (document.activeElement === input) {
      input.blur();
    }
  }, []);

  // Ghost Input for focusing on ios
  return (
    <>
      <input
        ref={ghostInputRef}
        aria-hidden="true"
        tabIndex={-1}
        type="text"
        style={{
          position: 'fixed',
          top: '54px',
          left: 0,
          width: '100%',
          height: '60px',
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          outline: 'none',
          padding: 0,
          fontSize: '16px',
          zIndex: -1,
        }}
      />
    <VaulDrawer.Root
      direction={isTablet ? 'top' : 'bottom'}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeSearchDrawer();
      }}
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay />
        <VaulDrawer.Content className="max-tablet:min-h-full">
      <div
        className="predictive-search bg-white h-full rounded-lg pb-64 "
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
                placeholder={t('common.search_placeholder')}
                type='text'
                ref={(node) => {
                  inputRef.current = node;
                  realInputRefCallback(node);
                }}
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
                className="overflow-y-scroll min-h-[300px] p-12"
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
                      {t('search.view_all_results_for')} <q>{term.current}</q>
                      &nbsp; →
                    </Button>
                  </Link>
                ) : null}
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
      </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
    </>
  );
}
