import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import Select from './select';

const options = [
    {value: 1, label: 'One'},
    {value: 'two', label: 'Two'}
];

describe('Select', () => {
    it('renders all options', () => {
        render(<Select options={options} />);
        expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual(['One', 'Two']);
    });

    it('renders the label and a disabled placeholder only when given', () => {
        const {unmount} = render(<Select options={options} />);
        expect(screen.queryByText('Limit')).not.toBeInTheDocument();
        expect(screen.getAllByRole('option')).toHaveLength(2);

        unmount();
        render(<Select options={options} label={'Limit'} placeholder={'Pick'} defaultValue={''} />);
        expect(screen.getByText('Limit')).toBeInTheDocument();
        expect(screen.getByRole('option', {name: 'Pick'})).toBeDisabled();
        expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('forwards native props such as onChange and value', async () => {
        const onChange = vi.fn();
        render(<Select options={options} value={1} onChange={onChange} />);

        const select = screen.getByRole('combobox');
        expect(select).toHaveValue('1');
        await userEvent.selectOptions(select, 'two');
        expect(onChange).toHaveBeenCalledOnce();
    });
});
