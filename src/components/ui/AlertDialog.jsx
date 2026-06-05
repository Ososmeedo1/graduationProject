import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { useTranslation } from 'react-i18next';

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning', // warning, danger, success, info
  isLoading = false,
  isPrompt = false,
  placeholder = '',
  inputValue = '',
  onInputChange
}) => {
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);

  const getIcon = () => {
    switch (type) {
      case 'danger': return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />;
      case 'success': return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />;
      case 'info': return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
      case 'warning':
      default: return <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />;
    }
  };

  const getIconBackground = () => {
    switch (type) {
      case 'danger': return 'bg-red-100 dark:bg-red-900/30';
      case 'success': return 'bg-green-100 dark:bg-green-900/30';
      case 'info': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'warning':
      default: return 'bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger': return 'danger';
      case 'success': return 'primary';
      default: return 'primary';
    }
  };

  // Fallbacks if not provided
  const effectiveConfirmText = confirmText || (type === 'danger' ? t('common.delete') : t('common.confirm'));
  const effectiveCancelText = cancelText || t('common.cancel');

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" initialFocus={cancelButtonRef} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="alert-dialog-panel relative transform overflow-hidden rounded-2xl bg-surface text-ink modal-surface glass-sheen border border-stroke text-left rtl:text-right px-4 pt-5 pb-4 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start rtl:space-x-reverse sm:space-x-4">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${getIconBackground()}`}>
                    {getIcon()}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left rtl:sm:mr-4 rtl:sm:ml-0 rtl:sm:text-right w-full">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-ink">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-ink-muted">
                        {message}
                      </p>
                      {isPrompt && (
                        <div className="mt-4">
                          <Input
                            placeholder={placeholder}
                            value={inputValue}
                            onChange={(e) => onInputChange?.(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-5 sm:flex sm:flex-row-reverse sm:gap-5">
                  <Button
                    variant={getConfirmButtonVariant()}
                    onClick={onConfirm}
                    className="w-full sm:w-auto"
                    isLoading={isLoading}
                  >
                    {effectiveConfirmText}
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-5 w-full sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    ref={cancelButtonRef}
                    disabled={isLoading}
                  >
                    {effectiveCancelText}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

AlertDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(['warning', 'danger', 'success', 'info']),
  isLoading: PropTypes.bool,
  isPrompt: PropTypes.bool,
  placeholder: PropTypes.string,
  inputValue: PropTypes.string,
  onInputChange: PropTypes.func
};

export default AlertDialog;
