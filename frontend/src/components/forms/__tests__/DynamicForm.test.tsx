import { render, screen, fireEvent } from '@testing-library/react';
import DynamicForm from '../DynamicForm';
import type { PropertyDefinition } from '@ianc/shared';

const stringProperty: PropertyDefinition = {
  name: 'resourceName',
  displayName: 'Resource Name',
  type: 'string',
  description: 'Name of the resource',
  placeholder: 'Enter resource name',
  validation: [{ type: 'required', message: 'Name is required' }],
  ui: { order: 1 },
};

const enumProperty: PropertyDefinition = {
  name: 'location',
  displayName: 'Location',
  type: 'string',
  description: 'Azure region',
  enum: [
    { value: 'eastus', label: 'East US' },
    { value: 'westus', label: 'West US' },
    { value: 'westeurope', label: 'West Europe' },
  ],
  ui: { order: 2 },
};

const numberProperty: PropertyDefinition = {
  name: 'instanceCount',
  displayName: 'Instance Count',
  type: 'number',
  description: 'Number of instances',
  placeholder: 'Enter count',
  ui: { order: 3 },
};

const booleanProperty: PropertyDefinition = {
  name: 'enableHttps',
  displayName: 'Enable HTTPS',
  type: 'boolean',
  description: 'Enable HTTPS traffic only',
  ui: { order: 4 },
};

describe('DynamicForm', () => {
  it('renders string input fields', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[stringProperty]}
        values={{}}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Resource Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter resource name')).toBeInTheDocument();
  });

  it('renders select dropdowns when enum options are provided', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[enumProperty]}
        values={{}}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('renders number inputs for number type properties', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[numberProperty]}
        values={{}}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Instance Count')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders boolean switches', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[booleanProperty]}
        values={{ enableHttps: false }}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Enable HTTPS')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('calls onChange when string input value changes', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[stringProperty]}
        values={{}}
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Enter resource name');
    fireEvent.change(input, { target: { value: 'my-resource' } });

    expect(onChange).toHaveBeenCalledWith({ resourceName: 'my-resource' });
  });

  it('calls onChange when boolean switch is toggled', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[booleanProperty]}
        values={{ enableHttps: false }}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith({ enableHttps: true });
  });

  it('shows required field indicators', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[stringProperty]}
        values={{}}
        onChange={onChange}
      />
    );

    // Ant Design renders a required indicator (asterisk) inside the label
    const formItem = screen.getByText('Resource Name').closest('.ant-form-item');
    expect(formItem).toBeInTheDocument();
    expect(formItem?.querySelector('.ant-form-item-required')).toBeInTheDocument();
  });

  it('properly orders fields by ui.order', () => {
    const highOrder: PropertyDefinition = {
      name: 'last',
      displayName: 'Should Be Last',
      type: 'string',
      ui: { order: 99 },
    };
    const lowOrder: PropertyDefinition = {
      name: 'first',
      displayName: 'Should Be First',
      type: 'string',
      ui: { order: 1 },
    };

    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[highOrder, lowOrder]}
        values={{}}
        onChange={onChange}
      />
    );

    const labels = screen.getAllByText(/Should Be/);
    expect(labels[0]).toHaveTextContent('Should Be First');
    expect(labels[1]).toHaveTextContent('Should Be Last');
  });

  it('renders multiple field types together', () => {
    const onChange = vi.fn();
    const schema = [stringProperty, numberProperty, booleanProperty];

    render(
      <DynamicForm
        schema={schema}
        values={{}}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Resource Name')).toBeInTheDocument();
    expect(screen.getByText('Instance Count')).toBeInTheDocument();
    expect(screen.getByText('Enable HTTPS')).toBeInTheDocument();
  });

  it('displays error messages', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[stringProperty]}
        values={{}}
        onChange={onChange}
        errors={{ resourceName: 'This field is required' }}
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('disables fields when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[stringProperty]}
        values={{}}
        onChange={onChange}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('Enter resource name');
    expect(input).toBeDisabled();
  });
});
