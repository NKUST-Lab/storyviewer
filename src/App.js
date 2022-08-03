import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Storyviewer from './Pages/Storyviewer';
import Default from './Pages/Default';

function App() {
  return (
    <Router basename="/storyviewer/">
      <Routes>
        <Route path='/' element={<Navigate to="/default" replace/>}/>
        <Route path='/default' element={<Default/>}/>
        <Route path='/:bookid' element={<Storyviewer/>}/>
      </Routes>
    </Router>
  );
}

export default App;
