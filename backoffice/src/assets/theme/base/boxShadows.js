/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/**
 * The base box-shadow styles for the Material Dashboard 2 React.
 * You can add new box-shadow using this file.
 * You can customized the box-shadow for the entire Material Dashboard 2 React using thie file.
 */

// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";

// Material Dashboard 2 React Helper Functions
import boxShadow from "assets/theme/functions/boxShadow";

const { black, white, tabs, coloredShadows } = colors;

const boxShadows = {
  xs: "0 2px 4px rgba(0, 0, 0, 0.075)",
  sm: "0 4px 6px rgba(0, 0, 0, 0.1)",
  md: "0 6px 8px rgba(0, 0, 0, 0.1)",
  lg: "0 8px 16px rgba(0, 0, 0, 0.1)",
  xl: "0 12px 24px rgba(0, 0, 0, 0.1)",
  xxl: "0 16px 32px rgba(0, 0, 0, 0.1)",
  inset: "inset 0 1px 2px rgba(0, 0, 0, 0.075)",
  colored: {
    primary: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4)",
    secondary: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(123, 128, 154, 0.4)",
    info: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(26, 115, 232, 0.4)",
    success: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(76, 175, 80, 0.4)",
    warning: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(251, 140, 0, 0.4)",
    error: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(244, 67, 54, 0.4)",
    light: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(240, 242, 245, 0.4)",
    dark: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(52, 71, 103, 0.4)",
  },
  navbarBoxShadow: "0 0 2rem 0 rgba(136, 152, 170, 0.15)",
  cardBoxShadow: "0 0 2rem 0 rgba(136, 152, 170, 0.15)",
  buttonBoxShadow: "0 4px 7px -1px rgba(0, 0, 0, 0.11), 0 2px 4px -1px rgba(0, 0, 0, 0.07)",
  inputBoxShadow: "0 0 0 0.2rem rgba(233, 30, 99, 0.25)",
  sliderBoxShadow: "0 0 0 0.2rem rgba(233, 30, 99, 0.25)",
  tabsBoxShadow: "0 0 0 0.2rem rgba(233, 30, 99, 0.25)",
};

export default boxShadows;
