/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useCallback, useRef } from 'react';
import AlertDialog from '../components/ui/AlertDialog';

export const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    type: 'warning',
    isLoading: false,
    isPrompt: false,
    placeholder: '',
    inputValue: '',
  });

  const resolver = useRef(null);

  const confirm = useCallback(({
    title,
    message,
    confirmText,
    cancelText,
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        isLoading: false,
        isPrompt: false,
        placeholder: '',
        inputValue: '',
      });
      resolver.current = resolve;
    });
  }, []);

  const prompt = useCallback(({
    title,
    message,
    placeholder = '',
    confirmText,
    cancelText,
    type = 'warning'
  }) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        isLoading: false,
        isPrompt: true,
        placeholder,
        inputValue: '',
      });
      resolver.current = resolve;
    });
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => {
      if (resolver.current) {
        resolver.current(prev.isPrompt ? null : false);
        resolver.current = null;
      }
      return { ...prev, isOpen: false };
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolver.current) {
      if (state.isPrompt) {
        // Return the input value for prompt, or null if cancelled
        resolver.current(state.inputValue);
      } else {
        // Return true for regular confirm
        resolver.current(true);
      }
      resolver.current = null;
    }
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [state.isPrompt, state.inputValue]);

  return (
    <AlertContext.Provider value={{ confirm, prompt }}>
      {children}
      <AlertDialog
        isOpen={state.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        type={state.type}
        isLoading={state.isLoading}
        isPrompt={state.isPrompt}
        placeholder={state.placeholder}
        inputValue={state.inputValue}
        onInputChange={(value) => setState((prev) => ({ ...prev, inputValue: value }))}
      />
    </AlertContext.Provider>
  );
};


