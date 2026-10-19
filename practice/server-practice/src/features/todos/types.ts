export interface ITodo {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export type INewTodo = Pick<ITodo, 'title' | 'description'>;

export type ITodoTransform = (todos: AsyncIterable<ITodo>) => AsyncIterable<ITodo>;
