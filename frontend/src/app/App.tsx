import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppRouter } from './providers/router';
import { userActions } from '@/entities/User';
import { getUserInited } from '@/entities/User';
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';

const App = () => {
    const dispatch = useDispatch();
    const inited = useSelector(getUserInited);

    useEffect(() => {
        dispatch(userActions.initAuthData());
    }, [dispatch]);

    if (!inited) {
        return <div>Загрузка...</div>;
    }

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
