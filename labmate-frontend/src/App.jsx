import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewExperiment from "./pages/NewExperiment";
import ExperimentDetail from "./pages/ExperimentDetail";
import VivaMode from "./pages/VivaMode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/experiment/new" element={<PrivateRoute><NewExperiment /></PrivateRoute>} />
        <Route path="/experiment/:id/edit" element={<PrivateRoute><NewExperiment /></PrivateRoute>} />
        <Route path="/experiment/:id" element={<PrivateRoute><ExperimentDetail /></PrivateRoute>} />
        <Route path="/experiment/:id/viva" element={<PrivateRoute><VivaMode /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}