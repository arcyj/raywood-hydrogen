import {data, useLoaderData} from 'react-router';
import {createJudgeMeClientFromEnv} from '~/lib/judgeme.server';
import {ReviewsSlider} from '~/components/reviews/ReviewsSlider';

export async function loader({
  context,
}: {
  context: {env: Record<string, string | undefined>};
}) {
  const judgeMe = createJudgeMeClientFromEnv(context.env);
  const reviews = await judgeMe.getPublicReviews();

  return data(
    {reviews},
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
    },
  );
}

export default function ReviewsPage() {
  const {reviews} = useLoaderData<typeof loader>();

  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-h2">
        Customer Reviews
      </h1>
      <ReviewsSlider reviews={reviews} />
    </section>
  );
}
