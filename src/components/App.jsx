import { Data, Context } from '../services/data'
import { createGlobalStyle } from "styled-components";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DiscourseComments } from "g-comments/react";
import "g-comments/styles.css";
import { FORUM_URL, forumHeaders } from "../services/comments";

const BodyFontSizeOverride = createGlobalStyle`
  body {
    font-size: 15px;
    background: url("/assets/bg-hg.jpeg") no-repeat center center fixed;
    background-size: cover;
  }
`;
const dataService = Data();
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={ queryClient }>
    <Context.Provider value={ dataService }>
      {/* theme="forum": the forum's palette, fonts and theme CSS apply underneath this site's
          own --gc-* tokens and rules, which keep winning */}
      <DiscourseComments forum={ FORUM_URL } headers={ forumHeaders } theme="forum">
        <BodyFontSizeOverride/>

        {/* comes first: the taskbar only lists the windows that open after it has mounted */}
        <Taskbar/>
        <Desktop/>
      </DiscourseComments>
    </Context.Provider>
  </QueryClientProvider>
);
export default App;
