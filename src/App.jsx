import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import MyList from './pages/MyList';
import Movies from './pages/Movies';
import TVShows from './pages/TvShows';
import NewPopular from './pages/NewPopular';

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen flex flex-col">
        <Routes>
          {/* Home Page */}
          <Route 
            path="/" 
            element={
              <>
                <Navbar />
                <Home />
                <Footer />
              </>
            } 
          />
          
          {/* Movie Detail Page */}
          <Route 
            path="/detail/:type/:id" 
            element={
              <>
                <Navbar />
                <MovieDetail />
                <Footer />
              </>
            } 
          />
          
          {/* Search Page */}
          <Route 
            path="/search" 
            element={
              <>
                <Navbar />
                <Search />
                <Footer />
              </>
            } 
          />
          
          {/* My List Page */}
          <Route 
            path="/mylist" 
            element={
              <>
                <Navbar />
                <MyList />
                <Footer />
              </>
            } 
          />
          
          {/* Movies Page */}
          <Route 
            path="/movies" 
            element={
              <>
                <Navbar />
                <Movies />
                <Footer />
              </>
            } 
          />
          
          {/* TV Shows Page */}
          <Route 
            path="/tv-shows" 
            element={
              <>
                <Navbar />
                <TVShows />
                <Footer />
              </>
            } 
          />
          
          {/* New & Popular Page */}
          <Route 
            path="/new" 
            element={
              <>
                <Navbar />
                <NewPopular />
                <Footer />
              </>
            } 
          />
          
          {/* Sign In/Up Pages (No Footer) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;