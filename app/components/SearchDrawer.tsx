import {Link} from 'react-router';
import {useId} from 'react';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {Input} from '~/components/ui/Input';
import {MagnifyingGlassIcon} from '@radix-ui/react-icons';
import {Drawer} from './ui/Drawer';
import {usePlaypeak} from '~/lib/playpeakContext';
import { Button } from './ui/Button';

export function SearchDrawer() {
  const queriesDatalistId = useId();
  const { isDrawerOpen, closeSearchDrawer } = usePlaypeak();
  const isOpen = isDrawerOpen('search');

  return (
    <Drawer
      onClose={closeSearchDrawer}
      visible={isOpen}
      position="top"
      className='bg-transparent overflow-hidden'
    >
      <div className="predictive-search bg-white m-12 min-h-[300px] max-h-[calc(100vh-150px)] max-w-[370px] tablet:max-w-[550px] mx-auto rounded-lg">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef, value}) => (
            <div>
              <Input
                name="q"
                value={value}
                handleChange={(value) =>
                  fetchResults({
                    target: {value},
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                placeholder="Search"
                ref={inputRef}
                type="text"
                // list={queriesDatalistId}
                Icon={MagnifyingGlassIcon}
                className='p-8'
              />
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <div className="overflow-y-scroll p-12">
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
