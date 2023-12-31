import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import countryLookup from "country-code-lookup";
import { PlayButton, FavoriteButton, VideoPlayer } from ".";
import { useInfoModal, useMovie } from "../hooks";
import { baseUrl, baseYoutubeUrl } from "@/public/utils";
import { Genre } from "@/src/types";
import { SiImdb } from "react-icons/si";
import { RiMovie2Line } from "react-icons/ri";
import { AiOutlineClose } from "react-icons/ai";
import { VscMute, VscUnmute } from "react-icons/vsc";
interface InfoModalProps {
  visible?: boolean;
  onClose: any;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(!!visible);
  const { mediaType, mediaId } = useInfoModal();
  const { data, isLoading } = useMovie(mediaType, mediaId);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoKey =
    data?.videos?.results.find(
      (video: { type: string }) => video.type === "Trailer"
    )?.key || data?.videos?.results[0]?.key;

  useEffect(() => {
    setIsVisible(!!visible);
  }, [visible]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleMute = () => {
    setIsMuted((prevIsMuted) => !prevIsMuted);
  };

  if (!visible || isLoading) {
    return null;
  }

  const getCountryName = (countryCode: string | number) => {
    try {
      const countryInfo = countryLookup.byIso(countryCode);
      return countryInfo ? countryInfo.country : countryCode;
    } catch (error) {
      console.error("Error fetching country information:", error);
      return countryCode;
    }
  };

  const isComingSoon = new Date(data?.release_date) > new Date();

  const MuteIcon = isMuted ? VscMute : VscUnmute;

  return (
    <div className="z-50 transition duration-300 bg-black bg-opacity-80 flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0">
      <div className="relative w-auto mx-auto max-w-3xl rounded-md overflow-hidden">
        <div
          className={`${
            isVisible ? "scale-100" : "scale-0"
          } transform duration-300 relative flex-auto bg-zinc-900 drop-shadow-md`}
        >
          <div className="relative h-96">
            {videoKey ? (
              <>
                <VideoPlayer
                  url={`${baseYoutubeUrl}${videoKey}`}
                  muted={isMuted}
                  controls={false}
                />
                <div className="absolute top-0 left-0 w-full h-full bg-transparent" />
              </>
            ) : (
              <img
                src={`${baseUrl}/${data?.backdrop_path || data?.poster_path}`}
                alt={data?.title}
                className="w-full h-full object-cover"
              />
            )}
            <div
              onClick={handleClose}
              className="cursor-pointer absolute top-3 right-3 h-10 w-10 rounded-full bg-black bg-opacity-70 flex items-center justify-center"
            >
              <AiOutlineClose size={24} className="text-white w-6" />
            </div>
            <div className="absolute bottom-[10%] left-10">
              <p className="text-white text-3xl md:text-4xl h-full lg:text-5xl font-bold mb-8">
                {data?.title || data?.name}
              </p>
              <div className="flex flex-row gap-4 items-center">
                {!isComingSoon && (
                  <PlayButton mediaType={mediaType} mediaId={mediaId} />
                )}
                {isComingSoon && (
                  <p
                    className="bg-white 
                      rounded-md 
                      py-1 md:py-2 
                      px-2 md:px-4
                      w-auto 
                      text-xs lg:text-lg 
                      font-semibold
                      flex
                      flex-row
                      items-center
                      hover:bg-neutral-300
                      transition text-black"
                  >
                    Coming Soon
                  </p>
                )}
                <FavoriteButton
                  mediaType={mediaType as string}
                  mediaId={mediaId as string}
                />
              </div>
            </div>
            <div
              onClick={handleMute}
              className="cursor-pointer group/item absolute bottom-10 right-3 rounded-full border-2 border-white bg-opacity-70 flex justify-center items-center transition hover:border-neutral-300 sm:w-10 w-7 sm:h-10 h-7"
            >
              <MuteIcon
                size={22}
                className="text-white group-hover/item:text-neutral-300 w-4 lg:w-6"
              />
            </div>
          </div>

          <div className="px-12 py-8">
            <div className="flex flex-row items-center gap-4 mb-1">
              <p className="text-green-400 font-semibold text-lg">
                {new Date(data?.release_date).getFullYear() ===
                new Date().getFullYear() ? (
                  <>
                    New{" "}
                    <span className="text-white">
                      {new Date(
                        data?.release_date || data?.first_air_date
                      ).getFullYear()}
                    </span>
                  </>
                ) : (
                  <span className="text-white">
                    {new Date(
                      data?.release_date || data?.first_air_date
                    ).getFullYear()}
                  </span>
                )}
              </p>
              <p className="text-white text-lg">
                {data?.runtime
                  ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min`
                  : `${data?.number_of_episodes} episodes`}
              </p>
              <div className="ml-auto px-2">
                <p className="text-violet-500 text-lg">
                  {data?.genres?.map((genre: Genre) => genre.name).join(", ")}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 mb-6">
              {data?.production_companies?.[0] && (
                <div className="flex items-center">
                  <div className="text-white text-lg mr-2">
                    {data.production_companies[0].name}
                  </div>
                  <span className="text-green-400 font-semibold text-lg">
                    {getCountryName(
                      data.production_companies[0].origin_country
                    )}
                  </span>
                </div>
              )}
              <div className="ml-auto flex items-center">
                {data?.imdb_id && (
                  <Link
                    href={`https://www.imdb.com/title/${data.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-500 mx-2"
                  >
                    <SiImdb size={26} />
                  </Link>
                )}
                {data?.id && (
                  <Link
                    href={`https://www.themoviedb.org/movie/${data?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    <RiMovie2Line size={30} />
                  </Link>
                )}
              </div>
            </div>
            <p className="text-white text-base">
              {data?.overview?.split(" ").length > 50
                ? `${data?.overview?.split(" ").slice(0, 50).join(" ")} ...`
                : data?.overview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
