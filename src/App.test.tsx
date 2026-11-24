import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Bedmap', () => {
  it('shows the demo garden checks', () => {
    window.location.hash = '/plan';
    render(<App />);
    const list = screen.getByRole('list', { name: 'Layout checks' });
    expect(list).toHaveTextContent('Lettuce and Courgette / squash are 42 cm apart; they need about 58 cm.');
    expect(list).toHaveTextContent('Runner bean and Onion are poor neighbours');
    expect(list).toHaveTextContent('Tomato and Basil are good companions.');
    expect(screen.getByTestId('check-summary')).toHaveTextContent('1 crowded');
  });

  it('draws a bed and plants with the keyboard', async () => {
    window.location.hash = '/plan';
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Clear demo garden' }));
    expect(screen.getByText('Nothing planted yet')).toBeInTheDocument();
    const grid = screen.getByRole('application');
    await user.click(screen.getByRole('radio', { name: 'Place plant' }));
    grid.focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByText('Plants go in beds. Draw a bed here first.').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('radio', { name: 'Draw bed' }));
    grid.focus();
    await user.keyboard('{ArrowRight}{ArrowDown}{Enter}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowDown}{Enter}');
    expect(screen.getAllByText('Bed 1 added: 1.2 × 0.6 m.').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('radio', { name: 'Place plant' }));
    await user.selectOptions(screen.getByLabelText('Plant'), 'tomato');
    grid.focus();
    await user.keyboard('{Enter}{ArrowLeft}{Enter}');
    expect(within(screen.getByRole('list', { name: 'Layout checks' })).getByText(/Tomato and Tomato are 30 cm apart/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Erase' }));
    grid.focus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByText('Tomato removed.').length).toBeGreaterThan(0);
    expect(screen.getByText('No problems found')).toBeInTheDocument();
  });

  it('paints sun and warns about shade-intolerant plants', async () => {
    window.location.hash = '/plan';
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: 'Paint sun' }));
    await user.click(screen.getByRole('radio', { name: 'Shade' }));
    const grid = screen.getByRole('application');
    grid.focus();
    // Move to the first tomato at column 3, row 5 and paint shade there.
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByRole('list', { name: 'Layout checks' })).toHaveTextContent('Tomato needs full sun, but this spot is shade.');
  });

  it('validates garden size and filters the plant catalogue', async () => {
    window.location.hash = '/plan';
    const user = userEvent.setup();
    render(<App />);
    await user.clear(screen.getByLabelText('Width (m)'));
    await user.type(screen.getByLabelText('Width (m)'), '50');
    await user.click(screen.getByRole('button', { name: 'Resize' }));
    expect(screen.getByText('Width and depth must be between 1 and 20 metres.')).toBeInTheDocument();
    window.location.hash = '/plants';
    await user.selectOptions(await screen.findByLabelText('Sun'), 'shade');
    expect(screen.getByText('2 shown')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Plant foxglove' }));
    expect(await screen.findByLabelText('Plant')).toHaveValue('foxglove');
  });

  it('counts plants for the list', () => {
    window.location.hash = '/list';
    render(<App />);
    expect(screen.getByTestId('count-tomato')).toHaveTextContent('3');
    expect(screen.getByText(/17 plants in 3 beds/)).toBeInTheDocument();
  });
});
