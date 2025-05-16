import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NaturalLanguageSearchPage from './pages/NaturalLanguageSearchPage';

// A simple placeholder for a home page
const HomePage = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>Welcome to the Absence Management System!</h1>
    <p>Navigate to <a href="/search">Natural Language Search</a> to try our AI-powered absence search.</p>
    {/* <p>Check out the <a href="/announcements">Announcements</a>.</p> */}
    {/* <p>Admins can <a href="/admin/announcements">Manage Announcements</a>.</p> */}
  </div>
);

const App = () => {
  return (
    <Router>
      {/* You might want to add a Navbar or Layout component here that's always visible */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<NaturalLanguageSearchPage />} />
        {/* Add other routes here as your application grows */}
      </Routes>
    </Router>
  );
}

export default App;