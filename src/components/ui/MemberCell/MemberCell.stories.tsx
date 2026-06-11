import type { Meta, StoryObj } from '@storybook/react';
import { MemberCell } from './MemberCell';

const meta = {
  title: 'Components/MemberCell',
  component: MemberCell,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MemberCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NameOnly: Story = {
  name: 'Avatar + Name',
  args: { name: '熊禹晴 Sunny', initial: '熊', color: 'hsl(270 55% 55%)' },
};

export const WithSub: Story = {
  name: 'Avatar + Name + Sub',
  args: { name: '熊禹晴 Sunny', initial: '熊', color: 'hsl(270 55% 55%)', sub: 'UIUX' },
};

export const WithPhoto: Story = {
  name: 'With Photo',
  args: { name: '吳奕蓁 Mia', photo: 'https://i.pravatar.cc/40?u=mia', sub: '平面視覺' },
};

export const SizeMd: Story = {
  name: 'Size md',
  args: { name: '陳巧玲 Charlie', initial: '陳', color: 'hsl(200 55% 50%)', sub: 'UIUX', size: 'md' },
};

export const List: Story = {
  name: 'List of members',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <MemberCell name="熊禹晴 Sunny"   initial="熊" color="hsl(270 55% 55%)" sub="UIUX" />
      <MemberCell name="吳奕蓁 Mia"     initial="吳" color="hsl(200 55% 50%)" sub="平面視覺" />
      <MemberCell name="陳巧玲 Charlie" initial="陳" color="hsl(30  55% 50%)" sub="UIUX" />
    </div>
  ),
};
