import ClearDay from "../assets/WeatherIcons/clear-day.svg";
import ClearNight from "../assets/WeatherIcons/night/clear-night.svg"
import PartlyCloudyDay from "../assets/WeatherIcons/partly-cloudy-day.svg";
import PartlyCloudyNight from "../assets/WeatherIcons/night/partly-cloudy-night.svg";
import OvercastDay from "../assets/WeatherIcons/overcast-day.svg";
import OvercastNight from "../assets/WeatherIcons/night/overcast-night.svg";
import Cloudy from "../assets/WeatherIcons/cloudy.svg";
import Fog from "../assets/WeatherIcons/fog.svg";
import NightFog from "../assets/WeatherIcons/night/fog-night.svg";
import LightDrizzle from "../assets/WeatherIcons/drizzle.svg";
import NightDrizzle from "../assets/WeatherIcons/night/partly-cloudy-night-drizzle.svg";
import Rain from "../assets/WeatherIcons/rain.svg";
import NightRain from "../assets/WeatherIcons/night/partly-cloudy-night-rain.svg";
import Snow from "../assets/WeatherIcons/snow.svg";
import NightSnow from "../assets/WeatherIcons/night/partly-cloudy-night-snow.svg";
import Snowers from "../assets/WeatherIcons/sleet.svg";
import SnowersNight from "../assets/WeatherIcons/night/partly-cloudy-night-sleet.svg";
import ThunderStorms from "../assets/WeatherIcons/thunderstorms.svg";
import NightThunderStorms from "../assets/WeatherIcons/night/thunderstorms-night.svg";

export const weatherIcons: {
  [code: number]: {
    day: { label: string; icon: string };
    night: { label: string; icon: string };
  };
} = {
  0: {
    day: { label: "Clear", icon: ClearDay },
    night: { label: "Clear", icon: ClearNight },
  },
  1: {
    day: { label: "Mostly Clear", icon: PartlyCloudyDay },
    night: { label: "Mostly Clear", icon: PartlyCloudyNight },
  },
  2: {
    day: { label: "Partly Cloudy", icon: OvercastDay },
    night: { label: "Partly Cloudy", icon: OvercastNight },
  },
  3: {
    day: { label: "Cloudy", icon: Cloudy },
    night: { label: "Cloudy", icon: Cloudy },
  },
  45: {
    day: { label: "Fog", icon: Fog },
    night: { label: "Fog", icon: NightFog },
  },
  48: {
    day: { label: "Fog", icon: Fog },
    night: { label: "Fog", icon: NightFog },
  },
  51: {
    day: { label: "Light Drizzle", icon: LightDrizzle },
    night: { label: "Light Drizzle", icon: NightDrizzle },
  },
  61: {
    day: { label: "Rain", icon: Rain },
    night: { label: "Rain", icon: NightRain },
  },
  71: {
    day: { label: "Snow", icon: Snow },
    night: { label: "Snow", icon: NightSnow },
  },
  80: {
    day: { label: "Showers", icon: Snowers },
    night: { label: "Showers", icon: SnowersNight },
  },
  95: {
    day: { label: "Thunderstorms", icon: ThunderStorms },
    night: { label: "Thunderstorms", icon: NightThunderStorms },
  },
};