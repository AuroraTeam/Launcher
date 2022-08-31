import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import Layout from './runtime/components/Layout';
import Login from './runtime/scenes/Login';

export default function App() {
    return (
        <RecoilRoot>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Login />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </RecoilRoot>
    );
}
