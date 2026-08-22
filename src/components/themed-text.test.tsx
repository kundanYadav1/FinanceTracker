import React from 'react';
import {render} from '@testing-library/react-native';
import {ThemedText} from './themed-text';

describe('ThemedText', () => {
  it('renders correctly', () => {
    const {toJSON} = render(<ThemedText>Test</ThemedText>);
    expect(toJSON).toMatchSnapshot();
  });
});