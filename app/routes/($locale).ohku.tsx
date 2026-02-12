import {useState, useEffect} from 'react';
import {Link, useLoaderData, useLocation} from 'react-router';
import {ButtonLink} from '~/components/ui/Link';
import {GiggleMonsterItemWrapper} from '~/components/GiggleMonsterItemWrapper';
import {GiggleMonsterProductCard} from '~/components/GiggleMonsterProductCard';
import type {GiggleMonsterProductCardProduct} from '~/components/GiggleMonsterProductCard';
import {useLocalizedPath} from '~/hooks/useLocalePath';

const GIGGLE_PRODUCT_HANDLES = [
  'giggle-monster-marshmallow-dreams-series-vinyl-plush-blind-box',
  'giggle-monster-furry-forest-series-vinyl-plush-blind-box',
] as const;

const GIGGLE_PRODUCT_QUERY = `#graphql
  query GiggleProducts($country: CountryCode, $language: LanguageCode, $handle: String!) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
        width
        height
      }
      selectedOrFirstAvailableVariant {
        id
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }
` as const;

const CDN_BASE = 'https://cdn.shopify.com/s/files/1/0738/0054/8663/files';

const PROMO_GIGGLE = {
  meet_title: 'Meet the GIGGLE MONSTER',
  cutest_creature: 'THE CUTEST COLLECTIBLE CREATURE',
  intro_description:
    "GIGGLE MONSTER by OHKU is an irresistibly cute collectible character that brightens any day. With playful expressions and high-quality details, it's the perfect fun gift for all ages.",
  get_now_button: 'Get Your GIGGLE MONSTER Now!',
  giggle_monster_alt: 'giggle monster',
  fluffy_planet_description:
    'The GIGGLE MONSTERS come from the Fluffy Planet, where many monster families live. Though they appear formidable with their sharp fangs and broad limbs, they are actually timid and curious about everything.',
  play_video: 'Play video',
  video_thumbnail: 'Video thumbnail',
  video_default_title: 'Video',
  warning_label: 'WARNING:',
  warning_message: 'MAY CAUSE UNCONTROLLABLE GIGGLES!',
  choose_title: 'Choose your GIGGLE MONSTER now!',
  product_description:
    "Each single box contains one figurine. No one knows what's inside the box before it is opened. Each regular figurine with odds 1/6, secret figurine with odds 1/72. Approximate height of the product is 13cm.",
  say_hi_title: 'Say hi to GIGGLE MONSTER!',
  unboxing_description:
    "Experience the joy of unboxing with the OHKU GIGGLE MONSTER Marshmallow Dreams and Furry Forest Series! Each blind box contains one surprise figure - you won't know which character you've got until you open it.",
  marshmallow_dreams_description:
    'Marshmallow Dream series features a cast of adorable, pastel-colored characters with soft, rounded features, each embodying a whimsical, dreamlike quality.',
  furry_forest_description:
    'Furry Forest characters take the form of animals - each with a mission to protect the peaceful world around them.',
  find_stores: 'Find Your GIGGLE MONSTER at these stores:',
  secret_edition: 'SECRET EDITION',
  buy_now: 'Buy Now',
} as const;

const HERO_IMAGES = [
  {src: `${CDN_BASE}/matcha-bubble.webp?v=1764848296`, alt: 'Matcha Bubble giggle monster'},
  {src: `${CDN_BASE}/mocha-cacao.webp?v=1764848296`, alt: 'Mocha Cacao giggle monster'},
  {src: `${CDN_BASE}/coconut-ash.webp?v=1764848296`, alt: 'Coconut Ash giggle monster'},
  {src: `${CDN_BASE}/sakura-puff.webp?v=1764848297`, alt: 'Sakura Puff giggle monster'},
  {src: `${CDN_BASE}/sea-salt-chill.webp?v=1764848296`, alt: 'Sea Salt Chill giggle monster'},
  {src: `${CDN_BASE}/snow-coconut.webp?v=1764848296`, alt: 'Snow Coconut giggle monster'},
  {src: `${CDN_BASE}/caramel-leopard.webp?v=1764848296`, alt: 'Caramel Leopard giggle monster'},
  {src: `${CDN_BASE}/Poppy.webp?v=1764851617`, alt: 'Poppy giggle monster'},
  {src: `${CDN_BASE}/Mimi.webp?v=1764851617`, alt: 'Mimi giggle monster'},
  {src: `${CDN_BASE}/Zesty.webp?v=1764851617`, alt: 'Zesty giggle monster'},
  {src: `${CDN_BASE}/Yanny.webp?v=1764851617`, alt: 'Yanny giggle monster'},
  {src: `${CDN_BASE}/Mochi.webp?v=1764851617`, alt: 'Mochi giggle monster'},
  {src: `${CDN_BASE}/Bobo.webp?v=1764851617`, alt: 'Bobo giggle monster'},
  {src: `${CDN_BASE}/Bamboo.webp?v=1764851617`, alt: 'Bamboo giggle monster'},
];

const MARSHMALLOW_CHARACTERS = [
  {image: `${CDN_BASE}/matcha-bubble.webp?v=1764848296`, alt: 'Matcha Bubble', name: 'Matcha Bubble'},
  {image: `${CDN_BASE}/mocha-cacao.webp?v=1764848296`, alt: 'Mocha Cacao', name: 'Mocha Cacao'},
  {image: `${CDN_BASE}/coconut-ash.webp?v=1764848296`, alt: 'Coconut Ash', name: 'Coconut Ash'},
  {image: `${CDN_BASE}/sakura-puff.webp?v=1764848297`, alt: 'Sakura Puff', name: 'Sakura Puff'},
  {image: `${CDN_BASE}/sea-salt-chill.webp?v=1764848296`, alt: 'Sea Salt Chill', name: 'Sea Salt Chill'},
  {image: `${CDN_BASE}/snow-coconut.webp?v=1764848296`, alt: 'Snow Coconut', name: 'Snow Coconut'},
];

const FURRY_FOREST_CHARACTERS = [
  {image: `${CDN_BASE}/Mimi.webp?v=1764851617`, alt: 'Mimi', name: 'Mimi', variant: 'blue' as const},
  {image: `${CDN_BASE}/Zesty.webp?v=1764851617`, alt: 'Zesty', name: 'Zesty', variant: 'blue' as const},
  {image: `${CDN_BASE}/Yanny.webp?v=1764851617`, alt: 'Yanny', name: 'Yanny', variant: 'blue' as const},
  {image: `${CDN_BASE}/Mochi.webp?v=1764851617`, alt: 'Mochi', name: 'Mochi', variant: 'blue' as const},
  {image: `${CDN_BASE}/Bobo.webp?v=1764851617`, alt: 'Bobo', name: 'Bobo', variant: 'blue' as const},
  {image: `${CDN_BASE}/Bamboo.webp?v=1764851617`, alt: 'Bamboo', name: 'Bamboo', variant: 'blue' as const},
];

export function meta() {
  return [{title: 'Giggle Monster | Playpeak'}];
}

function parseYouTubeVideoId(url: string): string {
  const m =
    url.match(/youtube\.com\/shorts\/([^/?&]+)/) ||
    url.match(/youtu\.be\/([^/?&]+)/) ||
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtube\.com\/embed\/([^/?&]+)/);
  return m ? m[1] : '';
}

export async function loader({
  context,
}: {
  context: {
    storefront: {
      query: (q: string, o?: {variables?: Record<string, unknown>}) => Promise<{
        product?: GiggleMonsterProductCardProduct | null;
      }>;
      i18n: {country: string; language: string};
    };
  };
}) {
  const youtubeUrl = 'https://www.youtube.com/shorts/5JNvrBYH_6M';
  const videoId = youtubeUrl ? parseYouTubeVideoId(youtubeUrl) : '';
  const videoThumbnailUrl =
    'https://cdn.shopify.com/s/files/1/0738/0054/8663/files/image_1920_88c84ece-9216-4445-a382-c9ec76cc868a.webp?v=1765202194';
  const {storefront} = context;
  const {country, language} = storefront.i18n;

  const [marshmallowResult, furryResult] = await Promise.all([
    storefront.query(GIGGLE_PRODUCT_QUERY, {
      variables: {
        handle: GIGGLE_PRODUCT_HANDLES[0],
        country: country ?? 'US',
        language: language ?? 'EN',
      },
    }),
    storefront.query(GIGGLE_PRODUCT_QUERY, {
      variables: {
        handle: GIGGLE_PRODUCT_HANDLES[1],
        country: country ?? 'US',
        language: language ?? 'EN',
      },
    }),
  ]);

  const product1 = marshmallowResult?.product ?? null;
  const product2 = furryResult?.product ?? null;

  return {
    videoId,
    youtubeUrl,
    videoThumbnailUrl,
    giggleProducts: [
      product1,
      product2,
    ] as [GiggleMonsterProductCardProduct | null, GiggleMonsterProductCardProduct | null],
  };
}

export default function OhkuPage() {
  const withLocale = useLocalizedPath();
  const location = useLocation();
  const {videoId: activeVideoId, videoThumbnailUrl, giggleProducts} = useLoaderData<typeof loader>();
  const [heroImage, setHeroImage] = useState(HERO_IMAGES[0]);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const idx = Math.floor(Math.random() * HERO_IMAGES.length);
    setHeroImage(HERO_IMAGES[idx]);
  }, []);

  const handlePlayVideo = () => setVideoPlaying(true);

  return (
    <div className="ohku-page">
      <style>{`
        main{
        margin:0 !important;
        padding:0 !important;
        }
        #buy-giggle-monster { scroll-margin-top: 80px; }
        html { scroll-behavior: smooth; }
        @media screen and (min-width: 750px) {
          .giggle-wiggle {
            animation: float 3s ease-in-out infinite;
            transition: transform 0.3s ease-in-out;
            transform-origin: center;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Hero section */}
      <div
        className=" pb-32 pt-16 tablet:pt-0 max-tablet:mt-[40px]"
        style={{
          background:
            'linear-gradient(180deg,rgba(227, 169, 183, 1) 56%, rgba(236, 209, 202, 1))',
        }}
      >
        <div className="tablet:flex block container mx-auto">
          <div className="w-full tablet:w-1/2 pt-8 flex items-center">
            <div className="text-center tablet:text-left mb-32 tablet:mb-0">
              <h1 className="text-[34px] text-center tablet:text-left tablet:text-[44px] tablet:leading-[64px] tablet:pb-12 font-extrabold text-black">
                {PROMO_GIGGLE.meet_title}
              </h1>
              <h2 className="text-[18px] text-center tablet:text-left tablet:text-[26px] inline font-bold text-black pt-8 tablet:px-8 tablet:pb-8 tablet:pt-12 bg-[#FFEE8C]">
                {PROMO_GIGGLE.cutest_creature}
              </h2>
              <p className="mb-16 tablet:mb-0 text-[18px] font-semibold mt-32 pb-32 text-center tablet:text-left text-black">
                {PROMO_GIGGLE.intro_description}
              </p>
              <a
                href="#buy-giggle-monster"
                className="inline-block text-nowrap text-center rounded-md font-semibold transition duration-300 max-tablet:w-full flex items-center justify-center gap-8 border-2 border-[#E40078] bg-[#E40078] text-white hover:text-black hover:bg-[#F2BDCD] hover:border-[#F2BDCD] [&amp;_.svg-wrapper_svg_path]:fill-white [&amp;_.svg-wrapper_svg_path]:transition-all [&amp;_.button-spinner_.path]:stroke-white [&amp;:hover_.button-spinner_.path]:stroke-black text-text-button-large px-24 py-16 !inline mx-auto tablet:mx-0 mb-32 tablet:mb-0"
              >
                <span>Get Your GIGGLE MONSTER Now!</span>
              </a>
            </div>
          </div>
          <div className="w-full tablet:w-1/2 flex justify-center">
            <img
              id="random-giggle-monster"
              src={heroImage.src}
              alt={heroImage.alt}
              width="100%"
              height={450}
              className="giggle-wiggle h-[250px] tablet:h-[550px] mb-12 mt-12 object-contain "
            />
          </div>
        </div>
      </div>

      {/* Video / fluffy planet section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://cdn.shopify.com/s/files/1/0738/0054/8663/files/giggle-bg.jpg?v=1764837039)`,
        }}
      >
        <div className="container mx-auto flex flex-col items-center min-h-[450px] tablet:min-h-[700px] justify-between">
          <p className="text-[18px] font-semibold mt-32 max-w-[750px] mx-auto text-center z-10 text-black">
            {PROMO_GIGGLE.fluffy_planet_description}
          </p>
          {activeVideoId && (
            <div
              className="tablet:w-[400px] w-full my-32 z-10 relative overflow-hidden rounded-lg"
              style={{aspectRatio: '9/16', maxHeight: '500px'}}
            >
              {!videoPlaying ? (
                <button
                  type="button"
                  className="relative w-full h-full bg-black border-0 cursor-pointer p-0 m-0 overflow-hidden flex items-center justify-center"
                  aria-label={PROMO_GIGGLE.play_video}
                  onClick={handlePlayVideo}
                >
                  {videoThumbnailUrl ? (
                    <img
                      src={videoThumbnailUrl}
                      alt={PROMO_GIGGLE.video_thumbnail}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">
                        {PROMO_GIGGLE.video_thumbnail}
                      </span>
                    </div>
                  )}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70px] h-[70px] flex items-center justify-center z-10 transition-transform hover:scale-110 pointer-events-none">
                    <svg
                      width="70"
                      height="70"
                      viewBox="0 0 70 70"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <circle
                        cx="34.7559"
                        cy="34.7559"
                        r="34.7559"
                        fill="#9812D2"
                      />
                      <path
                        d="M44.1016 31.7156C46.4565 33.0586 46.4567 36.4538 44.1016 37.7966L32.9658 44.1453C30.6325 45.4755 27.7324 43.7901 27.7324 41.1042L27.7324 28.407C27.7324 25.7211 30.6325 24.0357 32.9658 25.366L44.1016 31.7156Z"
                        fill="#E4ABB9"
                        stroke="#EB8BA2"
                        strokeWidth="3"
                      />
                    </svg>
                  </span>
                </button>
              ) : (
                <iframe
                  title={PROMO_GIGGLE.video_default_title}
                  src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`}
                  className="w-full h-full absolute top-0 left-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  loading="lazy"
                />
              )}
            </div>
          )}
          <p className="bg-[#FFEE8C] text-[12px] tablet:text-[16px] px-12 py-8 rounded inline-block font-semibold z-[10] text-black">
            <span className="font-extrabold">{PROMO_GIGGLE.warning_label}</span>
            {PROMO_GIGGLE.warning_message}
          </p>
        </div>
        <div
          className="absolute h-full w-full left-0 top-0 !block z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(236, 209, 202, 1) 10%, rgba(227, 169, 183, 0.1) 70%, rgba(236, 209, 202, 1))',
          }}
        />
      </div>

      {/* Buy / choose section */}
      <div
        style={{
          background:
            'linear-gradient(180deg,rgba(236, 209, 202, 1) 0%, rgba(236, 209, 202, 1))',
        }}
      >
        <div id="buy-giggle-monster" className="container mx-auto py-64">
          <div className="text-center mb-56">
            <h2 className="text-[26px] tablet:text-[36px] tablet:leading-[64px] font-extrabold text-black">
              {PROMO_GIGGLE.choose_title}
            </h2>
            <p className="text-[18px] font-semibold mt-8 text-black max-w-[750px] mx-auto">
              {PROMO_GIGGLE.product_description}
            </p>
          </div>
          <div className="flex flex-wrap gap-12 justify-center">
            {giggleProducts?.[0] && (
              <GiggleMonsterProductCard
                product={giggleProducts[0]}
                variant="pink"
                sectionId="ohku"
              />
            )}
            {giggleProducts?.[1] && (
              <GiggleMonsterProductCard
                product={giggleProducts[1]}
                variant="blue"
                sectionId="ohku"
              />
            )}
          </div>
        </div>
      </div>

      {/* Marshmallow Dreams – Say hi */}
      <div
        style={{
          background:
            'linear-gradient(180deg,rgba(236, 209, 202, 1) 75%, rgba(189, 221, 240, 1))',
        }}
      >
        <div className="container mx-auto py-32 tablet:py-64">
          <div className="text-center mb-56">
            <h2 className="text-[26px] tablet:text-[36px] tablet:leading-[64px] font-extrabold text-black">
              {PROMO_GIGGLE.say_hi_title}
            </h2>
            <p className="text-[18px] font-semibold mt-8 text-black max-w-[750px] mx-auto">
              {PROMO_GIGGLE.unboxing_description}.
            </p>
          </div>
          <div className="flex flex-col mediumDesktop:flex-row tablet:gap-12">
            <div className="grid max-w-[880px] grid-cols-2 w-full tablet:grid-cols-2 mediumDesktop:grid-cols-3 mediumDesktop:w-2/3 gap-12 order-2 mediumDesktop:order-1">
              {MARSHMALLOW_CHARACTERS.map((c) => (
                <GiggleMonsterItemWrapper
                  key={c.name}
                  image={c.image}
                  alt={c.alt}
                  name={c.name}
                />
              ))}
            </div>
            <div className="w-full mediumDesktop:w-1/3 flex flex-col justify-center items-center order-1 mediumDesktop:order-2 mb-12 mediumDesktop:mb-0">
              <div className="flex flex-col items-center">
                <img
                  src={`${CDN_BASE}/marshmallow-dream-logo.png?v=1764845979`}
                  alt={PROMO_GIGGLE.marshmallow_dreams_alt}
                  width="100%"
                  height="auto"
                  className="max-w-[300px] px-8 py-4 mb-16"
                />
                <p className="text-[18px] font-semibold text-center mb-32 max-w-[400px]">
                  {PROMO_GIGGLE.marshmallow_dreams_description}
                </p>
              </div>
              <div className="text-center w-full mt-16 mediumDesktop:mt-0 max-w-[285px]">
                <GiggleMonsterItemWrapper
                  image={`${CDN_BASE}/caramel-leopard.webp?v=1764848296`}
                  alt="Caramel Leopard"
                  name="Caramel Leopard"
                  secretEdition
                  secretEditionLabel={PROMO_GIGGLE.secret_edition}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Furry Forest */}
      <div
        className="tablet:pb-[64px] tablet:-mb-[100px]"
        style={{
          background:
            'linear-gradient(180deg,rgba(189, 221, 240, 1) 36%, rgba(128, 193, 231, 1) 76%)',
        }}
      >
        <div className="container mx-auto py-32 tablet:py-64">
          <div className="flex flex-col mediumDesktop:flex-row tablet:gap-12">
            <div className="grid max-w-[880px] grid-cols-2 w-full tablet:grid-cols-2 mediumDesktop:grid-cols-3 mediumDesktop:w-2/3 gap-12 order-2 mediumDesktop:order-1">
              {FURRY_FOREST_CHARACTERS.map((c) => (
                <GiggleMonsterItemWrapper
                  key={c.name}
                  image={c.image}
                  alt={c.alt}
                  name={c.name}
                  variant={c.variant}
                />
              ))}
            </div>
            <div className="mediumDesktop:w-1/3 flex flex-col justify-center items-center order-1 mediumDesktop:order-2 mb-12 mediumDesktop:mb-0">
              <div className="flex flex-col items-center">
                <img
                  src={`${CDN_BASE}/furry-forest-logo.png?v=1764853869`}
                  alt={PROMO_GIGGLE.furry_forest_alt}
                  width="100%"
                  height="auto"
                  className="max-w-[300px] bg-white/50 px-8 py-4 rounded-lg mb-16"
                />
                <p className="text-[18px] font-semibold text-center mb-32 max-w-[400px]">
                  {PROMO_GIGGLE.furry_forest_description}
                </p>
              </div>
              <div className="text-center mt-16 tablet:mt-0 w-full tablet:max-w-[285px]">
                <GiggleMonsterItemWrapper
                  image={`${CDN_BASE}/Poppy.webp?v=1764851617`}
                  alt="Poppy"
                  name="Poppy"
                  variant="blue"
                  secretEdition
                  secretEditionLabel={PROMO_GIGGLE.secret_edition}
                />
              </div>
            </div>
          </div>

          {/* Store logos */}
          <div className="flex flex-col items-center mt-64">
            <p className="text-[16px] font-bold mb-16">
              {PROMO_GIGGLE.find_stores}
            </p>
            <div className="flex items-center gap-32 flex-wrap justify-center">
              <Link to={withLocale('/')} className="focus-inset">
                {/* Logo placeholder – use your Header logo component or Image from Hydrogen */}
                <span className="font-bold">Playpeak</span>
              </Link>
              <a
                href="https://www.pegasas.lt/catalogsearch/result?q=giggle%20monster"
                target="_blank"
                rel="nofollow noreferrer"
              >
                <img
                  src={`${CDN_BASE}/pegasas-logo.webp?v=1765273985`}
                  alt="Pegasas Logo"
                  width="140"
                  height="auto"
                  className="max-w-[140px]"
                />
              </a>
              <a
                href="https://www.karupoegpuhh.ee/catalogsearch/result/?q=giggle+monster"
                target="_blank"
                rel="nofollow noreferrer"
              >
                <img
                  src={`${CDN_BASE}/puhh_logo.png?v=1765274609`}
                  alt="Puhh Logo"
                  width="160"
                  height="auto"
                  className="max-w-[160px]"
                />
              </a>
              <a
                href="https://comics.lv/"
                target="_blank"
                rel="nofollow noreferrer"
              >
                <img
                  src={`${CDN_BASE}/comicslv_font_logo_black_lv.png?v=1768379380`}
                  alt="Comics Logo"
                  width="160"
                  height="auto"
                  className="max-w-[160px]"
                />
              </a>
              <a
                href="https://store.yuranka.com/search?q=giggle&options%5Bprefix%5D=last"
                target="_blank"
                rel="nofollow noreferrer"
              >
                <img
                  src={`${CDN_BASE}/yuranka.avif?v=1768379380`}
                  alt="Yuranka Logo"
                  width="120"
                  height="auto"
                  className="max-w-[120px]"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
