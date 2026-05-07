import type { FC } from "react";
import { Image } from '@shopify/hydrogen';
import { Link } from "react-router";
import {useLocalizedPath} from '~/hooks/useLocalePath';
import { useTranslation } from '~/lib/i18nContext';
interface IBannerProps {
  heading: string;
  text?: string;
  logo?: string;
  overlayFromColor?: string;
  overlayToColor?: string;
  backgroundImage?: string;
  overlayDirection?: 'to right' | '180deg';
  textColor?: 'white' | 'dark';
  buttonText?: string;
  buttonUrl: string;
}

export const Banner: FC<IBannerProps> = ({
  heading = "Heading",
  text,
  backgroundImage,
  logo,
  overlayFromColor,
  overlayToColor,
  overlayDirection = 'to right',
  textColor = 'white',
  buttonText,
  buttonUrl
}) => {
  const withLocale = useLocalizedPath();
  const { t } = useTranslation();
  return(
    <div
      className="rounded-lg tablet:min-h-[475px] bg-black relative h-full overflow-hidden bg-no-repeat bg-cover h-full"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full tw-inset-0 opacity-80"
        style={{
          background: overlayFromColor ? `linear-gradient(${overlayDirection}, ${overlayFromColor}, ${overlayToColor})` : undefined,
        }}
      ></div>
      <div className="flex flex-col flex-col-reverse pt-48 pb-48 tablet:flex tablet:flex-col items-center p-32 tablet:rounded relative tablet:min-h-[475px] justify-center ">
        <div className="flex flex-col items-center text-center">
          <span className="block mb-[42px] max-w-[300px]">
            <Image src={logo} alt={t('banner.logo_alt')} height="auto" width="100%" />
          </span>
          <div className="">
              <h2 className={`max-tablet:text-center text-h1 pb-8 tablet:text-center ${textColor === 'white' ? 'text-white' : 'text-black' }`}>
                {heading}
              </h2>
              <p className={`max-tablet:text-center max-w-[550px] text-h4 pb-24 tablet:text-center ${textColor === 'white' ? 'text-white' : 'text-black' }`}>
                {text}
              </p>
              <Link
                to={withLocale(buttonUrl)}
                className="inline-block text-nowrap text-center rounded-md font-semibold transition duration-300 max-tablet:w-full flex items-center justify-center gap-8 bg-yellow-400 text-black hover:bg-yellow-500 text-text-button-large px-24 py-16 tablet:max-w-[320px] max-tablet:w-full tablet:mx-auto">
                <span>{buttonText}</span>
              </Link>
          </div>
        </div>
        <div className="flex justify-center items-center justify-center items-center">
        </div>
      </div>
    </div>
  )
}
