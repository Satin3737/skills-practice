import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import TextInput from './text-input';

describe('TextInput', () => {
    it('renders a label tied to the input when given', () => {
        render(<TextInput label={'Name'} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('forwards native props', async () => {
        const onChange = vi.fn();
        render(<TextInput placeholder={'Type'} onChange={onChange} />);

        await userEvent.type(screen.getByPlaceholderText('Type'), 'ab');
        expect(onChange).toHaveBeenCalledTimes(2);
    });
});
