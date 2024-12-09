import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store"
import { createRoot } from 'react-dom/client';
import App from './App'; // Assuming App is the main component

const root = document.getElementById('root');

// Use createRoot to render your application
createRoot(root).render(
<Provider store={store}>
    <App />
</Provider>

);

