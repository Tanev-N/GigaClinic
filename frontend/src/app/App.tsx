import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppRouter } from './providers/router';
import { userActions } from '@/entities/User';
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(userActions.initAuthData());
    }, [dispatch]);

    return (
        <div className="app">
            <Header />
            <main className="content">
                <AppRouter />
            </main>
            <Footer />
        </div>
    );
};

export default App;
