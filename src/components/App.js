import React from 'react';
import { Data, Context } from '../services/data'
import { createGlobalStyle } from "styled-components";
import { GlobalStyle, ThemeProvider } from "@react95/core";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";

const BodyFontSizeOverride = createGlobalStyle`
  body {
    font-size: 15px;
    background: url("./assets/bg-hg.jpeg") no-repeat center center fixed;
  }
`;
const dataService = Data();

const App = () => (
  <Context.Provider value={dataService}>
    <ThemeProvider>
      <GlobalStyle/>
      <BodyFontSizeOverride/>

      <Desktop/>
      <Taskbar/>
    </ThemeProvider>
  </Context.Provider>
);
export default App;
