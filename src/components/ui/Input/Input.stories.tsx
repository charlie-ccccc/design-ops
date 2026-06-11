import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    as: { control: 'radio', options: ['input', 'select'] },
    disabled: { control: 'boolean' },
    hasError: { control: 'boolean' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  name: 'Text Input',
  args: {
    as: 'input',
    type: 'text',
    placeholder: '搜尋...',
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Input {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  name: 'With Value',
  args: {
    as: 'input',
    type: 'text',
    defaultValue: '銀行活存定期利率研究',
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Input {...args} />
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'Error State',
  args: {
    as: 'input',
    type: 'text',
    defaultValue: 'invalid value',
    hasError: true,
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Input {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    as: 'input',
    type: 'text',
    defaultValue: '已停用',
    disabled: true,
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Input {...args} />
    </div>
  ),
};

export const SelectVariant: Story = {
  name: 'Select Dropdown',
  args: {
    as: 'select',
  },
  render: (args) => (
    <div style={{ width: 200 }}>
      <Input {...args}>
        <option value="">全部部門</option>
        <option value="ui">UI 設計</option>
        <option value="gd">平面視覺</option>
        <option value="mg">行銷</option>
        <option value="pm">產品管理</option>
      </Input>
    </div>
  ),
};

export const ToolbarLayout: Story = {
  name: 'Toolbar Layout',
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <Input type="text" placeholder="搜尋任務..." style={{ width: 200 }} />
      <Input as="select" style={{ width: 140 }}>
        <option value="">全部部門</option>
        <option value="ui">UI 設計</option>
        <option value="gd">平面視覺</option>
      </Input>
      <Input as="select" style={{ width: 120 }}>
        <option value="">全部狀態</option>
        <option value="todo">待辦</option>
        <option value="doing">進行中</option>
        <option value="done">完成</option>
      </Input>
    </div>
  ),
};
