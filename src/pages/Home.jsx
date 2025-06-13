import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard on home page access
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Home;