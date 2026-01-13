import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import StartPage from './component/StartPage';
import LoginPage from './component/LoginPage';
import PrologPage from './pages/prologPage';
import RankPage from "./component/RankPage";
import PrincipalPage from "./pages/principalPage";
import ComputerLabPage from "./pages/computerLabPage";
import Hallway from "./pages/hallway";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/prolog" element={<PrologPage />} />
        <Route path="/rank" element={<RankPage />} />
        <Route path="/principal" element={<PrincipalPage />} />
        <Route path="/computer" element={<ComputerLabPage />} />
        <Route path="/hallway" element={<Hallway />} />
      </Routes>
    </Router>
  )
}

export default App