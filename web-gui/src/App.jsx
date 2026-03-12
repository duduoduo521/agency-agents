import { BrowserRouter, Routes, Route } from'react-router-dom'
import { ApiProvider } from './contexts/ApiContext'
import MainLayout from'./layouts/MainLayout'
import HomePage from'./pages/HomePage'
import WorkflowPage from'./pages/WorkflowPage'
import AgentPage from'./pages/AgentPage'
import SettingsPage from'./pages/SettingsPage'
import TaskPage from'./pages/TaskPage'
import RobotConfigPage from './pages/RobotConfigPage'

function App() {
 return (
    <ApiProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
           <Route path="task" element={<TaskPage />} />
            <Route path="workflow" element={<WorkflowPage />} />
            <Route path="agent" element={<AgentPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="robot-config" element={<RobotConfigPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApiProvider>
  )
}

export default App;