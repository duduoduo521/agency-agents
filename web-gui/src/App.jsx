import { BrowserRouter, Routes, Route } from'react-router-dom'
import MainLayout from'./layouts/MainLayout'
import HomePage from'./pages/HomePage'
import WorkflowPage from'./pages/WorkflowPage'
import AgentPage from'./pages/AgentPage'
import SettingsPage from'./pages/SettingsPage'
import TaskPage from'./pages/TaskPage'

function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
         <Route path="task" element={<TaskPage />} />
          <Route path="workflow" element={<WorkflowPage />} />
          <Route path="agent" element={<AgentPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
