import { motion } from "framer-motion";

const About = () => {
  return (
    <motion.div
      className="w-full p-5 flex flex-col justify-center items-center mb-5 mt-3 md:mt-5 md:mb-0"
      initial={{ opacity: 0, y: 50, scale: 0.95 }} // Börja osynlig, lite nedanför och något mindre
      animate={{ opacity: 1, y: 0, scale: 1 }} // Fade in till fullt synlig, på plats och full storlek
      transition={{ duration: 0.5, ease: "easeOut" }} // 1 sekund lång animation med mjuk easing
    >
      <div className="flex flex-col gap-8 w-full md:w-2/4">
        <div className="flex flex-col gap-2 leading-7">
          <h1 className="text-lg font-semibold">Hitta Ställen Nära Dig</h1>
          <p>
            Oavsett om du är på jakt efter en ny restaurang för lunch eller en
            bar för en kväll ute, ger Platsguiden dig en snabb och enkel
            översikt över de bästa alternativen i din närhet. 😃
          </p>
        </div>

        <div className="flex flex-col gap-8 leading-7">
          <div className="flex flex-col gap-3 mt-3 mb-3">
            <h1 className="text-lg font-semibold">
              Vad kan du göra på platsguiden?
            </h1>
            <ul className="flex flex-col gap-4">
              <li>
                <span className="font-semibold">
                  Se närmaste restauranger och barer:
                </span>{" "}
                Få en lista på de 15 närmaste restaurangerna och barerna baserat
                på din plats, och få information om avstånd och öppettider.
              </li>
              <li>
                <span className="font-semibold">Visa på karta:</span> Varje
                restaurang eller bar visas på en interaktiv karta tillsammans
                med din egen position för att hjälpa dig att hitta rätt.
              </li>
              <li>
                <span className="font-semibold">Detaljerad information:</span>{" "}
                Om det finns tillgänglig information som telefonnummer,
                webbplats och öppettider, kommer dessa att visas direkt på varje
                plats. Om information saknas, kan du snabbt söka efter stället
                på webben via en länk.
              </li>
              <li>
                <span className="font-semibold">Exakt position:</span> Vid
                användning på mobil kommer sidan att använda din exakta
                GPS-position för bästa träff, medan användare på datorer kan få
                en uppskattad position baserat på IP-adressen (vilket kan vara
                något mindre exakt).
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 ">
            <h1 className="font-semibold text-lg">Om</h1>
            <p>
              Platsguiden är byggd med hjälp av Overpass API och skapad av
              Alexander Lind 2025. <br />
              Se min{" "}
              <a
                href="https://github.com/Lindetti"
                target="_blank"
                className="underline text-orange-500"
              >
                Github
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
