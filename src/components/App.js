import React from 'react';
import { Data, Context } from '../services/data'
import { createGlobalStyle } from "styled-components";
import { GlobalStyle, ThemeProvider } from "@react95/core";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import { QueryClient, QueryClientProvider } from "react-query";

const BodyFontSizeOverride = createGlobalStyle`
  body {
    font-size: 15px;
    background: url("./assets/bg-hg.jpeg") no-repeat center center fixed;
    background-size: cover;
  }
`;
const dataService = Data();
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={ queryClient }>
    <Context.Provider value={ dataService }>
      <ThemeProvider>
        <GlobalStyle/>
        <BodyFontSizeOverride/>

        <Desktop/>
        <Taskbar/>
      </ThemeProvider>
    </Context.Provider>
  </QueryClientProvider>

);
export default App;
