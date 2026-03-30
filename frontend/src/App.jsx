import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ApplicantDashboard from "./pages/ApplicantDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import ChooseRole from "./pages/ChooseRole";
import ApplicantRegister from "./pages/ApplicantRegister";
import EmployerRegister from "./pages/EmployerRegister";

function App() {

return (
<AuthProvider>
<BrowserRouter>

<Routes>
<Route path="/" element={<HomePage />} />
<Route path="/applicant-dashboard" element={<ApplicantDashboard />} />

<Route path="/employer-dashboard" element={<EmployerDashboard />} />
<Route path="/login" element={<Login />} />
<Route path="/chooserole" element={<ChooseRole />} />
<Route path="/register/applicant" element={<ApplicantRegister />} />
<Route path="/register/employer" element={<EmployerRegister />} />

</Routes>

</BrowserRouter>
</AuthProvider>
);

}

export default App;