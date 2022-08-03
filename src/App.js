import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Storyviewer from './Pages/Storyviewer';

function App() {
  return (
    <Router basename="/storyviewer/">
      <Routes>
        <Route path='/' element={<Navigate to="/152" replace/>}/>
        <Route path='/:bookid' element={<Storyviewer/>}/>
      </Routes>
    </Router>
  );
}

export default App;
