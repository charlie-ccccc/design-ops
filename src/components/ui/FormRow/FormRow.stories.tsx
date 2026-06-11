import type { Meta, StoryObj } from '@storybook/react';
import { FormRow, FormGrid } from './FormRow';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/FormRow',
  component: FormRow,
} satisfies Meta<typeof FormRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleRow: Story = {
  name: 'Single Row',
  render: () => (
    <div style={{ width: 320 }}>
      <FormRow label="任務標題">
        <Input type="text" placeholder="輸入任務標題..." />
      </FormRow>
    </div>
  ),
};

export const SelectRow: Story = {
  name: 'With Select',
  render: () => (
    <div style={{ width: 320 }}>
      <FormRow label="負責部門">
        <Input as="select">
          <option value="">選擇部門</option>
          <option value="ui">UI 設計</option>
          <option value="gd">平面視覺</option>
        </Input>
      </FormRow>
    </div>
  ),
};

export const TwoColumnGrid: Story = {
  name: 'Two-Column Grid',
  render: () => (
    <div style={{ width: 480 }}>
      <FormGrid cols={2}>
        <FormRow label="原估工時">
          <Input type="number" placeholder="0" />
        </FormRow>
        <FormRow label="實際工時">
          <Input type="number" placeholder="0" />
        </FormRow>
      </FormGrid>
    </div>
  ),
};

export const FullForm: Story = {
  name: 'Full Form Layout',
  render: () => (
    <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FormRow label="任務標題">
        <Input type="text" placeholder="輸入任務標題..." />
      </FormRow>
      <FormGrid cols={2}>
        <FormRow label="負責部門">
          <Input as="select">
            <option value="">選擇部門</option>
            <option value="ui">UI 設計</option>
          </Input>
        </FormRow>
        <FormRow label="類別">
          <Input as="select">
            <option value="uiux">UIUX</option>
            <option value="gd">平面視覺</option>
          </Input>
        </FormRow>
      </FormGrid>
      <FormGrid cols={2}>
        <FormRow label="原估工時">
          <Input type="number" placeholder="0" />
        </FormRow>
        <FormRow label="截止日期">
          <Input type="text" placeholder="MM/DD" />
        </FormRow>
      </FormGrid>
    </div>
  ),
};
