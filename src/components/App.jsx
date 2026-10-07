import { Data, Context } from '../services/data'
import { createGlobalStyle } from "styled-components";
import Desktop from "./Desktop";
import Taskbar from "./Taskbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
      <BodyFontSizeOverride/>

      {/* comes first: the taskbar only lists the windows that open after it has mounted */}
      <Taskbar/>
      <Desktop/>
    </Context.Provider>
  </QueryClientProvider>

);
export default App;
