import {Link} from 'react-router';
import {Pagination} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import { Button } from './ui/Button';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className='text-h2 mb-24 mt-44'>Articles</h2>
      <div>
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item text-regular-semi" key={article.id}>
              <Link prefetch="intent" to={articleUrl} className='hover:text-primary'>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className='text-h2 mb-24 mt-44'>Pages</h2>
      <div>
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item text-regular-semi" key={page.id}>
              <Link prefetch="intent" to={pageUrl} className='hover:text-primary'>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className='text-h2 mb-24 mt-44'>Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={undefined}
            />
          ));

          return (
            <div>
              <div className='mb-12 w-full text-center'>
                <PreviousLink>
                  {isLoading ? 'Loading...' : <Button variant="secondary" className='max-w-[450px]'>↑ Load previous</Button>}
                </PreviousLink>
              </div>
              <div className='products-grid auto-rows-[minmax(0,1fr)]'>
                {ItemsMarkup}
              </div>
              <div className='w-full text-center'>
                <NextLink>
                  {isLoading ? 'Loading...' : <Button variant="secondary" className='max-w-[450px]'>Load more ↓</Button>}
                </NextLink>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsEmpty() {
  return <p>No results, try a different search.</p>;
}
