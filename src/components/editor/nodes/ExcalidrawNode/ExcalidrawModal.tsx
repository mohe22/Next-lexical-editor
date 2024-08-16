
import CustomModal from '@/components/ui/custom-modal';
import './ExcalidrawModal.css';

import {Excalidraw} from '@excalidraw/excalidraw';
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from '@excalidraw/excalidraw/types/types';
import * as React from 'react';
import {ReactPortal, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';



export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements'];

type Props = {
  closeOnClickOutside?: boolean;
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
};

export const useCallbackRefState = () => {
  const [refValue, setRefValue] =
    React.useState<ExcalidrawImperativeAPI | null>(null);
  const refCallback = React.useCallback(
    (value: ExcalidrawImperativeAPI | null) => setRefValue(value),
    [],
  );
 
  return [refValue, refCallback] as const;
};


export default function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props): ReactPortal | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
  const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState();
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] =
    useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);

  
  useEffect(() => {
    if (excaliDrawModelRef.current !== null) {
      excaliDrawModelRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        excaliDrawModelRef.current !== null &&
        !excaliDrawModelRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onDelete();
      }
    };

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener('click', clickOutsideHandler);
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onDelete]);

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDelete();
      }
    };

    if (currentModalRef !== null) {
      currentModalRef.addEventListener('keydown', onKeyDown);
    }

    return () => {
      if (currentModalRef !== null) {
        currentModalRef.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [elements, files, onDelete]);

  const save = () => {
    if (elements && elements.filter((el) => !el.isDeleted).length > 0) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === 'dark',
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  };

  const discard = () => {
    if (elements && elements.filter((el) => !el.isDeleted).length === 0) {
      // delete node if the scene is clear
      onDelete();
    } else {
      //Otherwise, show confirmation dialog before closing
      setDiscardModalOpen(true);
    }
  };

  
  function ShowDiscardDialog(): JSX.Element {
    return (
      <div
        role='dilog'
        ref={excaliDrawModelRef}
        className={
          `fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`
        }
       >
        <div 
          className={
            `
            absolute left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] 
            translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 
            data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 
            data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 
            data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] 
           

            `
          }>
            Are you sure you want to discard the changes?
            <div className="flex flex-col w-full gap-y-2">
              <Button
              variant={"destructive"}
                onClick={() => {
                  setDiscardModalOpen(false);
                  onClose();
                }}>
                Discard
              </Button>{' '}
              <Button
                onClick={() => {
                  setDiscardModalOpen(false);
                }}>
                Cancel
              </Button>
            </div>
        </div>
      </div>
     
    );
  }

  if (isShown === false) {
    return null;
  }

  const onChange = (
    els: ExcalidrawInitialElements,
    _: AppState,
    fls: BinaryFiles,
  ) => {
    setElements(els);
    setFiles(fls);
  };


  return createPortal(
      <div
        role='dilog'
        ref={excaliDrawModelRef}
        className={
          `fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out 
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`
        }
       >
        <div 
          className={
            `
            relative left-[50%] top-[50%] z-50 flex items-center justify-center h-full translate-x-[-50%] translate-y-[-50%] gap-4 
            border p-4 shadow-lg  rounded-md sm:rounded-lg
            `
          }>
          {discardModalOpen && <ShowDiscardDialog />}
          <div className='h-[40vw] rounded-md w-[70vw] '>
          <Excalidraw
            onChange={onChange}
            excalidrawAPI={excalidrawAPIRefCallback}
            
            initialData={{
              appState: initialAppState || {isLoading: false},
              elements: initialElements,
              files: initialFiles,
            }}
          />
          </div>
          <div className="flex flex-row gap-x-2 z-[60] absolute top-3 right-10 ">
            <Button variant={"outline"} className='h-[30px] px-2' size={"none"} onClick={discard}>
              Discard
            </Button>
            <Button  variant={"outline"} className='h-[30px] px-2' size={"none"}  onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </div>
    ,
    document.body,
  );
}
