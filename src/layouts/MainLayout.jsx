import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AnnouncementBar from '../components/AnnouncementBar/AnnouncementBar';

function MainLayout() {
  return (
    <>
      <AnnouncementBar />
      <header>
        <Header />
      </header> 

      <main>
        <Outlet />
      </main>

      <footer>
        <Footer />
      </footer>
    </>
  );
}
 
export default MainLayout;