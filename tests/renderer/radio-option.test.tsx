import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RadioOption } from '@renderer/components/ui/radio-option';

describe('RadioOption', () => {
  it('renders label and reflects checked state via aria-checked', () => {
    render(<RadioOption label="My option" checked={true} onClick={vi.fn()} />);
    const node = screen.getByRole('radio');
    expect(node).toHaveAttribute('aria-checked', 'true');
    expect(node).toHaveTextContent('My option');
  });

  it('aria-checked=false when not checked', () => {
    render(<RadioOption label="X" checked={false} onClick={vi.fn()} />);
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick on Enter keydown', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('radio'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls onClick on Space keydown', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('radio'), { key: ' ' });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick on other keys', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} />);
    fireEvent.keyDown(screen.getByRole('radio'), { key: 'a' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled=true → no callbacks fire, aria-disabled set, tabIndex=-1', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} disabled />);
    const node = screen.getByRole('radio');
    expect(node).toHaveAttribute('aria-disabled', 'true');
    expect(node).toHaveAttribute('tabIndex', '-1');
    fireEvent.click(node);
    fireEvent.keyDown(node, { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders meta on the right when provided', () => {
    render(<RadioOption label="X" checked onClick={vi.fn()} meta={<span data-testid="m">META</span>} />);
    expect(screen.getByTestId('m')).toHaveTextContent('META');
  });

  it('renders adornment between dot and label when provided', () => {
    render(<RadioOption label="X" checked onClick={vi.fn()} adornment={<span data-testid="a">📁</span>} />);
    expect(screen.getByTestId('a')).toBeInTheDocument();
  });

  it('keyboard handler does not fire when disabled even if Enter pressed', () => {
    const onClick = vi.fn();
    render(<RadioOption label="X" checked={false} onClick={onClick} disabled />);
    fireEvent.keyDown(screen.getByRole('radio'), { key: ' ' });
    expect(onClick).not.toHaveBeenCalled();
  });
});
