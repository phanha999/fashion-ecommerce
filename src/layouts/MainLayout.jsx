import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';

function MainLayout() {
  return (
    <>
      <header>
        <Header />
      </header> 

      <main>
        <Outlet />
      </main>

      <footer>
        
      </footer>
    </>
  );
}

export default MainLayout;