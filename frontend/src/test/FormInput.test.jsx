import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormInput from '../components/FormInput';

describe('FormInput Component', () => {
  it('renders input with label', () => {
    render(<FormInput label="Email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<FormInput label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('shows required asterisk when required prop is true', () => {
    render(<FormInput label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange handler when input value changes', () => {
    const handleChange = vi.fn();
    render(<FormInput label="Email" onChange={handleChange} />);
    
    const input = screen.getByLabelText(/email/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies error styling when error is present', () => {
    render(<FormInput label="Email" error="Invalid email" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveClass('border-error-500');
  });
});