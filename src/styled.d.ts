import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      surfaceAlt: string;
      border: string;
      text: string;
      muted: string;
      yellow: string;
      green: string;
      red: string;
    };
  }
}
