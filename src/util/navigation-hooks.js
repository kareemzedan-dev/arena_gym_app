import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/**
 * A hook to replace the old NavigationEvents component.
 * Handles focus and blur events using the new navigation hooks.
 * 
 * @param {Object} props
 * @param {Function} props.onWillFocus - Called when screen is about to focus
 * @param {Function} props.onWillBlur - Called when screen is about to blur
 */
export const useNavigationEvents = ({ onWillFocus, onWillBlur }) => {
  useFocusEffect(
    useCallback(() => {
      // Call onWillFocus when screen focuses
      if (onWillFocus) {
        onWillFocus();
      }

      // Return cleanup function that will be called when screen blurs
      return () => {
        if (onWillBlur) {
          onWillBlur();
        }
      };
    }, [onWillFocus, onWillBlur])
  );
};

/**
 * A hook to handle back button behavior
 * 
 * @param {Function} handler - Function to call when back button is pressed
 */
export const useBackHandler = (handler) => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
      return () => subscription.remove();
    }, [handler])
  );
};