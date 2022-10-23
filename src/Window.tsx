import { FC } from "react";
import ReactModal from "./Modal";

export interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onFocus?: () => void;
  initWidth: number | string;
  initHeight: number | string;
}

export const Window: FC<WindowProps> = ({
  children,
  title,
  isOpen,
  onClose,
  onFocus,
  initWidth,
  initHeight
}) => {
  return (
    <ReactModal
      initWidth={initWidth}
      initHeight={initHeight}
      onFocus={onFocus}
      className={"my-modal-custom-class"}
      onRequestClose={onClose}
      isOpen={isOpen}
      title={title}
    >
      {children}
      <button onClick={onClose}>Close modal</button>
    </ReactModal>
  );
};
