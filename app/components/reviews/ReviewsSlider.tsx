import {Link} from 'react-router';
import {Slider} from '~/components/Slider';
import {useBreakpoints} from '~/hooks/useBreakpoints';
import type {PublicJudgeMeReview} from '~/lib/judgeme.server';
import {StarRating} from './StarRating';
import { BadgeCheck } from 'lucide-react';

export type PublicReviewCard = PublicJudgeMeReview;

function ReviewCard({review}: {review: PublicReviewCard}) {
  return (
    <article className="h-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-semibold text-midnight">
          {review.reviewerFirstName}
        </p>
        <div className='flex space-x-8'>
          <StarRating rating={review.rating} />
          <div className="flex flex-wrap items-center text-xs mb-0">
            {review.isVerified && (
              <span className="bg-green-100 flex rounded-full py-4 px-8">
                <BadgeCheck className="text-green-700" />
                <span className=" px-2 py-1 font-semibold text-green-700">
                  Verified
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <p className=" line-clamp-5 min-h-24 text-sm leading-relaxed text-midnight/80 mb-8">
        {review.body}
      </p>

      <div className="mt-auto space-y-3 space-x-8 flex items-center">
        {review.product && (
          <>
            {review.product.handle &&
            review.product.handle != 'judgeme-shop-reviews' ? (
              <Link
                to={`../products/${review.product.handle}`}
                relative="path"
                className="flex items-center gap-3"
              >
                <p className="text-sm font-semibold text-midnight/80 hover:underline">
                  {review.product.title}
                </p>
              </Link>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}

export function ReviewsSlider({reviews}: {reviews: PublicReviewCard[]}) {
  const {isDesktop} = useBreakpoints();

  if (!reviews.length) return null;

  return (
    <Slider
      fadeUnderArrows
      settings={{
        slidesToShow: 'auto',
        spaceBetween: 12,
        dots: true,
        arrows: isDesktop,
        options: {
          dragFree: true,
        },
      }}
      className="[&_.embla__dot--selected]:bg-midnight [&_.embla__dot]:bg-midnight/25 [&_.embla__dot]:h-2 [&_.embla__dot]:w-2 [&_.embla__dots]:mt-6"
    >
      {reviews.map((review) => (
        <div key={review.id} className="w-[280px] tablet:w-[360px] h-full max-h-[210px]">
          <ReviewCard review={review} />
        </div>
      ))}
    </Slider>
  );
}
