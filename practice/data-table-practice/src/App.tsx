import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {CommentsDataTable, PostsDataTable, UsersDataTable} from '@/features';
import styles from './app.module.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            placeholderData: (prev: unknown) => prev,
            retry: 3
        }
    }
});

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <div className={styles.main}>
                <h1 className={'title'}>Data table component</h1>
                <div className={styles.wrapper}>
                    <PostsDataTable />
                    <UsersDataTable />
                    <CommentsDataTable />
                </div>
            </div>
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
};

export default App;
