import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewYearGreeting from './components/NewYearGreeting';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewYearGreeting />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
