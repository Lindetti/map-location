import Clear from "../assets/WeatherIcons/clear-day.svg";
import MostlyClear from "../assets/WeatherIcons/partly-cloudy-day.svg";
import PartlyCloudy from "../assets/WeatherIcons/overcast-day.svg";
import Cloudy from "../assets/WeatherIcons/cloudy.svg";
import Fog from "../assets/WeatherIcons/fog.svg";
import LightDrizzle from "../assets/WeatherIcons/drizzle.svg";
import Rain from "../assets/WeatherIcons/rain.svg";
import Snow from "../assets/WeatherIcons/snow.svg";
import Snowers from "../assets/WeatherIcons/sleet.svg";
import ThunderStorms from "../assets/WeatherIcons/thunderstorms.svg";

export const weatherIcons: { [code: number]: { label: string; icon: string } } =
  {
    0: { label: "Clear", icon: Clear },
    1: { label: "Mostly Clear", icon: MostlyClear },
    2: { label: "Partly Cloudy", icon: PartlyCloudy },
    3: { label: "Cloudy", icon: Cloudy },
    45: { label: "Fog", icon: Fog },
    48: { label: "Fog", icon: Fog },
    51: { label: "Light Drizzle", icon: LightDrizzle },
    61: { label: "Rain", icon: Rain },
    71: { label: "Snow", icon: Snow },
    80: { label: "Showers", icon: Snowers },
    95: { label: "Thunderstorms", icon: ThunderStorms },
  };
