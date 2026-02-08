import { Provider } from 'jotai';

import { Router } from './router';

export default function App() {
    return (
        <Provider>
            <Router />
        </Provider>
    );
}
