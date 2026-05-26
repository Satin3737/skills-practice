import type {IDataTableColumn} from '@/components/data-table';
import type {IComment} from './types';

export const columns: IDataTableColumn<IComment>[] = [
    {title: 'ID', dataKey: 'id', sortable: true},
    {title: 'Post ID', dataKey: 'postId', sortable: true},
    {title: 'Title', dataKey: 'name', sortable: true},
    {title: 'Content', dataKey: 'body', sortable: true}
];
