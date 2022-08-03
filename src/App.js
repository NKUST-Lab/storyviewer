import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Storyviewer from './Pages/Storyviewer';

function App() {
  return (
    <Router basename="/storyviewer/">
      <Routes>
        <Route path='/' element={<Navigate to="/storyviewer/152/1" replace/>}/>
        <Route path='/storyviewer/:bookid' element={<Storyviewer/>}/>
      </Routes>
    </Router>
  );
}

export default App;
