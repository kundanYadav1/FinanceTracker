/// <reference types="jest" />

import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from './themed-text';

describe('ThemedText', () => {
  it('renders correctly', async () => {
    const { toJSON } = await render(<ThemedText>Test</ThemedText>);
    expect(toJSON()).toMatchSnapshot();
  });
});
