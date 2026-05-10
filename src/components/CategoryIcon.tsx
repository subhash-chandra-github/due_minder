import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryId } from '../types';
import { CATEGORY_MAP } from '../constants/categories';

interface Props {
  categoryId: CategoryId;
  size?: number;       // icon size
  boxSize?: number;    // container size
  borderRadius?: number;
}

export default function CategoryIcon({
  categoryId,
  size = 18,
  boxSize = 38,
  borderRadius = 10,
}: Props) {
  const cat = CATEGORY_MAP[categoryId];
  if (!cat) return null;

  return (
    <View
      style={[
        styles.box,
        {
          width: boxSize,
          height: boxSize,
          borderRadius,
          backgroundColor: cat.bgColor,
        },
      ]}
    >
      <Ionicons name={cat.icon as any} size={size} color={cat.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
