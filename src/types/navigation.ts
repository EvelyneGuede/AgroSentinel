export type AppScreen =
  | "splash"
  | "home"
  | "diagnostic"
  | "vocal"
  | "sentinel"
  | "weather"
  | "roi"
  | "logistics"
  | "marketplace";

export type Navigate = (screen: AppScreen) => void;
export type GoBack = () => void;
