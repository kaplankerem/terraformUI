import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/layout/Header';
import AppSidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ResourceDesigner from './pages/ResourceDesigner';
import Projects from './pages/Projects';

const { Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout className="app-layout">
        <AppHeader />
        <Layout>
          <AppSidebar />
          <Content className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/designer" element={<ResourceDesigner />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ResourceDesigner />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
