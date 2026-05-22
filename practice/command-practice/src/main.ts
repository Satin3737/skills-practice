import {ArrowDown01, ArrowUp10, FileDigit, RedoDot, RefreshCcwDot, UndoDot, createIcons} from 'lucide';
import App from '@/scripts/App';
import '@/styles/index.css';

createIcons({
    icons: {
        RedoDot,
        UndoDot,
        ArrowUp10,
        ArrowDown01,
        RefreshCcwDot,
        FileDigit
    }
});

new App();
