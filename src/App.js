import React, { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Licenses from './pages/Licenses';
import Products from './pages/Products';
import Manager from './pages/Manager';
import AdminProducts from './pages/AdminProducts';
import AdminLicenses from './pages/AdminLicenses';
import NotFound from './pages/NotFound';
import AuthCallback from './components/AuthCallback';
import './App.css';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="content">{children}</main>
    <Footer />
  </>
);

const routes = [
  { path: "/", component: <Home /> },
  { path: "/licenses", component: <Licenses /> },
  { path: "/products", component: <Products /> },
  { path: "/manager", component: <Manager /> },
  { path: "/admin/products", component: <AdminProducts /> },
  { path: "/admin/licenses", component: <AdminLicenses /> },
  { path: "*", component: <NotFound /> },
];

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          {routes.map(({ path, component }) => (
            <Route key={path} path={path} element={<Layout>{component}</Layout>} />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;