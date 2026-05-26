import type {IDataTableColumn} from '@/components/data-table';
import type {IPost} from './types';

export const columns: IDataTableColumn<IPost>[] = [
    {title: 'ID', dataKey: 'id', sortable: true},
    {title: 'User ID', dataKey: 'userId', sortable: true},
    {title: 'Title', dataKey: 'title', sortable: true},
    {title: 'Content', dataKey: 'body', sortable: true}
];
