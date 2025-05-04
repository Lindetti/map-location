import { useEffect } from "react";

const PrivacyPolicy = () => {
  // Scrolla till toppen när komponenten monteras
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Tom dependency array = körs bara vid mount

  return (
    // Centrerad container med maxbredd och padding
    <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white dark:bg-transparent rounded-lg mt-5 mb-10">
      <h1 className="text-3xl font-bold mb-6 border-b pb-3 dark:text-gray-300">
        Integritetspolicy
      </h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3 dark:text-gray-300">
          Lagring av Data på Din Enhet
        </h2>
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
          För att förbättra användarupplevelsen och optimera prestanda, lagrar
          Platsguiden viss information lokalt på din enhet (dator, mobil eller
          surfplatta). Detta görs genom teknologier som localStorage och
          sessionStorage.
        </p>
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
          Den data vi lagrar är **inte** personligt identifierbar och används
          enbart för att minska antalet API-förfrågningar och för att snabba upp
          laddningstider när du använder tjänsten.
        </p>
      </section>

      <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 dark:text-gray-300">Vad lagras?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 leading-relaxed space-y-2">
          <li>
            <strong>Väderinformation:</strong> För att undvika att samma
            väderdata hämtas flera gånger under en kort tidsperiod, lagras data
            om aktuellt väder temporärt (i localStorage med tidsstämpel).
          </li>
          <li>
            <strong>Navigeringsdata (Rutter):</strong> För att snabba upp
            visning av tidigare visade rutter, kan vägbeskrivningsdata sparas i
            localStorage.
          </li>
          <li>
            <strong>Användarpreferenser/Sessiondata:</strong> Information om
            huruvida du sett vissa initiala meddelanden (t.ex. väderladdning)
            kan sparas i sessionStorage för att undvika att de visas igen under
            samma webbläsarsession.
          </li>
          <li>
            <strong>Senast visad stad:</strong> För att snabbt kunna visa namnet
            på staden du senast befann dig i sparas detta i localStorage.
          </li>
          <li>
            <strong>API-anropsräknare (klient):</strong> En enkel räknare sparas
            i localStorage för att ge en indikation på hur många anrop som
            gjorts mot externa tjänster under en dag, som ett skydd mot
            överanvändning på klientsidan.
          </li>
        </ul>
      </section>

      <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 dark:text-gray-300">Syfte med lagringen</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 leading-relaxed space-y-2">
          <li>
            <strong>Förbättrad prestanda:</strong> Genom att lagra information
            lokalt på din enhet minskar vi antalet förfrågningar till externa
            servrar, vilket resulterar i snabbare laddningstider och en mer
            responsiv upplevelse.
          </li>
          <li>
            <strong>Minskad datatrafik:</strong> Färre API-anrop innebär mindre
            dataförbrukning och gör att appen fungerar mer effektivt.
          </li>
        </ul>
      </section>

      <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 dark:text-gray-300">Hur länge lagras data?</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200 leading-relaxed space-y-2">
          <li>
            <strong>SessionStorage:</strong> Data lagras endast under den
            aktuella webbläsarsessionen och raderas automatiskt när du stänger
            webbläsarfönstret eller fliken.
          </li>
          <li>
            <strong>LocalStorage:</strong> Data lagras på din enhet tills du
            aktivt rensar din webbläsardata eller om applikationen själv skriver
            över/tar bort den (t.ex. för utgången väderdata).
          </li>
        </ul>
      </section>

      <section className="mb-6">
      <h2 className="text-2xl font-semibold mb-3 dark:text-gray-300">
          Hur kan jag ta bort lagrad data?
        </h2>
        <p className="text-gray-700 leading-relaxed dark:text-gray-200">
          Du kan manuellt rensa den lagrade datan från din webbläsare. För att
          rensa localStorage eller sessionStorage för Platsguiden, gå till din
          webbläsares inställningar för webbplatser och välj att rensa data
          specifikt för denna webbplats. Exakt hur du gör detta varierar mellan
          olika webbläsare.
        </p>
      </section>


    </div>
  );
};

export default PrivacyPolicy;
